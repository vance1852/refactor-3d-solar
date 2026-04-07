/**
 * 3D Building Floor Cutaway Visualization
 *
 * A 3D interactive building viewer that allows users to:
 * - View a multi-story building with transparent/cutaway floors
 * - Click floors to isolate and inspect them
 * - Toggle furniture/equipment visibility per floor
 * - Animate floor separation (exploded view)
 * - Heatmap overlay showing occupancy density
 *
 * WARNING: This is a monolithic file. All logic is crammed here:
 * scene setup, building generation, floor management, heatmap,
 * camera, UI, animation — everything in one place with tons of
 * global state and copy-paste code.
 */
import * as THREE from "three";

// ============ GLOBAL STATE DUMP ============
let scene, camera, renderer, raycaster, mouse;
let buildingGroup;
let floors = []; // { mesh, walls, furniture, label, heatmap, index }
let isDragging = false,
  lastMouseX = 0,
  lastMouseY = 0;
let cameraRadius = 50,
  cameraTheta = Math.PI / 4,
  cameraPhi = Math.PI / 3;
let cameraTarget = new THREE.Vector3(0, 8, 0);
let isExploded = false,
  explodeProgress = 0;
let selectedFloor = null;
let showFurniture = true,
  showHeatmap = false;
let animatingExplode = false,
  explodeDirection = 1;
let floorCount = 6;
let floorHeight = 3.5;
let buildingWidth = 20,
  buildingDepth = 14;
let hoveredFloor = null;
let clock = new THREE.Clock();

// ============ FLOOR CONFIG (hardcoded, repetitive) ============
const FLOOR_CONFIGS = [
  {
    name: "大堂 & 前台",
    color: 0x8fbc8f,
    occupancy: 0.3,
    furnitureType: "lobby",
    rooms: [
      { x: 0, z: 0, w: 18, d: 12, label: "主大堂" },
      { x: -6, z: -4, w: 5, d: 4, label: "安保室" },
    ],
  },
  {
    name: "开放办公区 A",
    color: 0x87ceeb,
    occupancy: 0.85,
    furnitureType: "office",
    rooms: [
      { x: -5, z: 0, w: 8, d: 12, label: "Alpha 团队" },
      { x: 5, z: 0, w: 8, d: 12, label: "Beta 团队" },
    ],
  },
  {
    name: "开放办公区 B",
    color: 0x87ceeb,
    occupancy: 0.6,
    furnitureType: "office",
    rooms: [
      { x: -5, z: 0, w: 8, d: 12, label: "Gamma 团队" },
      { x: 5, z: 0, w: 8, d: 12, label: "Delta 团队" },
    ],
  },
  {
    name: "会议 & 研讨",
    color: 0xdda0dd,
    occupancy: 0.45,
    furnitureType: "meeting",
    rooms: [
      { x: -6, z: -3, w: 6, d: 5, label: "会议室 A" },
      { x: 6, z: -3, w: 6, d: 5, label: "会议室 B" },
      { x: -6, z: 3, w: 6, d: 5, label: "会议室 C" },
      { x: 6, z: 3, w: 6, d: 5, label: "董事会议室" },
    ],
  },
  {
    name: "机房 & IT",
    color: 0xf0e68c,
    occupancy: 0.15,
    furnitureType: "server",
    rooms: [
      { x: -4, z: 0, w: 10, d: 10, label: "服务器机房" },
      { x: 6, z: 0, w: 6, d: 10, label: "IT 办公室" },
    ],
  },
  {
    name: "屋顶花园",
    color: 0x90ee90,
    occupancy: 0.2,
    furnitureType: "garden",
    rooms: [{ x: 0, z: 0, w: 16, d: 10, label: "花园区域" }],
  },
];

// ============ INIT (massive function) ============
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    500,
  );
  updateCameraPosition();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Lights
  const ambient = new THREE.AmbientLight(0x404060, 1.2);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(30, 50, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 120;
  dirLight.shadow.camera.left = -30;
  dirLight.shadow.camera.right = 30;
  dirLight.shadow.camera.top = 30;
  dirLight.shadow.camera.bottom = -30;
  scene.add(dirLight);
  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
  fillLight.position.set(-20, 30, -10);
  scene.add(fillLight);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(100, 100);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a3e,
    roughness: 0.9,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.1;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid helper
  const grid = new THREE.GridHelper(100, 50, 0x333355, 0x222244);
  grid.position.y = 0;
  scene.add(grid);

  // Build the building
  buildingGroup = new THREE.Group();
  scene.add(buildingGroup);
  createBuilding();

  // Events
  setupEvents();
}

// ============ BUILDING CREATION (lots of copy-paste) ============
function createBuilding() {
  for (let i = 0; i < floorCount; i++) {
    const config = FLOOR_CONFIGS[i];
    const yBase = i * floorHeight;
    const floorData = { index: i, config, meshes: [], yBase };

    // Floor slab
    const slabGeo = new THREE.BoxGeometry(buildingWidth, 0.3, buildingDepth);
    const slabMat = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.set(0, yBase, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    slab.userData = { floorIndex: i, type: "slab" };
    buildingGroup.add(slab);
    floorData.slab = slab;
    floorData.meshes.push(slab);

    // Walls (4 sides, copy-paste for each)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xddeeff,
      roughness: 0.3,
      metalness: 0.05,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    // Front wall
    const frontWallGeo = new THREE.PlaneGeometry(
      buildingWidth,
      floorHeight - 0.3,
    );
    const frontWall = new THREE.Mesh(frontWallGeo, wallMat.clone());
    frontWall.position.set(0, yBase + floorHeight / 2, buildingDepth / 2);
    frontWall.userData = { floorIndex: i, type: "wall" };
    buildingGroup.add(frontWall);
    floorData.meshes.push(frontWall);
    // Back wall
    const backWall = new THREE.Mesh(frontWallGeo.clone(), wallMat.clone());
    backWall.position.set(0, yBase + floorHeight / 2, -buildingDepth / 2);
    backWall.rotation.y = Math.PI;
    backWall.userData = { floorIndex: i, type: "wall" };
    buildingGroup.add(backWall);
    floorData.meshes.push(backWall);
    // Left wall
    const sideWallGeo = new THREE.PlaneGeometry(
      buildingDepth,
      floorHeight - 0.3,
    );
    const leftWall = new THREE.Mesh(sideWallGeo, wallMat.clone());
    leftWall.position.set(-buildingWidth / 2, yBase + floorHeight / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.userData = { floorIndex: i, type: "wall" };
    buildingGroup.add(leftWall);
    floorData.meshes.push(leftWall);
    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeo.clone(), wallMat.clone());
    rightWall.position.set(buildingWidth / 2, yBase + floorHeight / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.userData = { floorIndex: i, type: "wall" };
    buildingGroup.add(rightWall);
    floorData.meshes.push(rightWall);

    // Furniture (different per floor type, massive switch)
    const furnitureGroup = new THREE.Group();
    furnitureGroup.userData = { floorIndex: i, type: "furniture" };
    if (config.furnitureType === "lobby") {
      // Reception desk
      const deskGeo = new THREE.BoxGeometry(6, 1.2, 1.5);
      const deskMat = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.6,
      });
      const desk = new THREE.Mesh(deskGeo, deskMat);
      desk.position.set(0, yBase + 0.75, -3);
      desk.castShadow = true;
      furnitureGroup.add(desk);
      // Sofas
      for (let s = 0; s < 3; s++) {
        const sofaGeo = new THREE.BoxGeometry(2.5, 0.8, 1);
        const sofaMat = new THREE.MeshStandardMaterial({
          color: 0x4a6741,
          roughness: 0.7,
        });
        const sofa = new THREE.Mesh(sofaGeo, sofaMat);
        sofa.position.set(-6 + s * 6, yBase + 0.55, 3);
        sofa.castShadow = true;
        furnitureGroup.add(sofa);
      }
      // Plants
      for (let p = 0; p < 4; p++) {
        const potGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 8);
        const potMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const pot = new THREE.Mesh(potGeo, potMat);
        pot.position.set(-7 + p * 4.5, yBase + 0.45, 5);
        furnitureGroup.add(pot);
        const plantGeo = new THREE.SphereGeometry(0.6, 8, 8);
        const plantMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const plant = new THREE.Mesh(plantGeo, plantMat);
        plant.position.set(-7 + p * 4.5, yBase + 1.1, 5);
        furnitureGroup.add(plant);
      }
    } else if (config.furnitureType === "office") {
      // Desks in rows
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
          const dGeo = new THREE.BoxGeometry(1.8, 0.8, 1);
          const dMat = new THREE.MeshStandardMaterial({
            color: 0xb8860b,
            roughness: 0.5,
          });
          const d = new THREE.Mesh(dGeo, dMat);
          d.position.set(-7 + col * 3.5, yBase + 0.55, -4 + row * 4);
          d.castShadow = true;
          furnitureGroup.add(d);
          // Chair
          const cGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
          const cMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
          const c = new THREE.Mesh(cGeo, cMat);
          c.position.set(-7 + col * 3.5, yBase + 0.4, -4 + row * 4 + 0.8);
          furnitureGroup.add(c);
        }
      }
    } else if (config.furnitureType === "meeting") {
      // Conference tables
      config.rooms.forEach((room, ri) => {
        const tGeo = new THREE.BoxGeometry(room.w * 0.6, 0.8, room.d * 0.5);
        const tMat = new THREE.MeshStandardMaterial({
          color: 0x654321,
          roughness: 0.4,
        });
        const t = new THREE.Mesh(tGeo, tMat);
        t.position.set(room.x, yBase + 0.55, room.z);
        t.castShadow = true;
        furnitureGroup.add(t);
        // Chairs around table
        for (let ci = 0; ci < 6; ci++) {
          const chGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
          const chMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
          const ch = new THREE.Mesh(chGeo, chMat);
          const angle = (ci / 6) * Math.PI * 2;
          ch.position.set(
            room.x + Math.cos(angle) * (room.w * 0.35),
            yBase + 0.4,
            room.z + Math.sin(angle) * (room.d * 0.3),
          );
          furnitureGroup.add(ch);
        }
      });
    } else if (config.furnitureType === "server") {
      // Server racks
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 3; c++) {
          const rackGeo = new THREE.BoxGeometry(1, 2.5, 0.8);
          const rackMat = new THREE.MeshStandardMaterial({
            color: 0x2f2f2f,
            metalness: 0.5,
            roughness: 0.3,
          });
          const rack = new THREE.Mesh(rackGeo, rackMat);
          rack.position.set(-6 + c * 3, yBase + 1.4, -3 + r * 2.5);
          rack.castShadow = true;
          furnitureGroup.add(rack);
          // LED indicators
          const ledGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
          const ledMat = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.3 ? 0x00ff00 : 0xff0000,
          });
          for (let l = 0; l < 5; l++) {
            const led = new THREE.Mesh(ledGeo, ledMat.clone());
            led.material.color.setHex(
              Math.random() > 0.3 ? 0x00ff00 : 0xff4444,
            );
            led.position.set(
              -6 + c * 3 + 0.45,
              yBase + 0.5 + l * 0.4,
              -3 + r * 2.5 + 0.35,
            );
            furnitureGroup.add(led);
          }
        }
      }
    } else if (config.furnitureType === "garden") {
      // Trees
      for (let t = 0; t < 6; t++) {
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(-6 + t * 2.5, yBase + 0.9, Math.sin(t) * 3);
        furnitureGroup.add(trunk);
        const canopyGeo = new THREE.SphereGeometry(1, 8, 8);
        const canopyMat = new THREE.MeshStandardMaterial({
          color: 0x228b22 + Math.floor(Math.random() * 0x003300),
        });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(-6 + t * 2.5, yBase + 2.2, Math.sin(t) * 3);
        canopy.castShadow = true;
        furnitureGroup.add(canopy);
      }
      // Benches
      for (let b = 0; b < 3; b++) {
        const benchGeo = new THREE.BoxGeometry(2, 0.4, 0.6);
        const benchMat = new THREE.MeshStandardMaterial({ color: 0xa0522d });
        const bench = new THREE.Mesh(benchGeo, benchMat);
        bench.position.set(-4 + b * 4, yBase + 0.35, -4);
        furnitureGroup.add(bench);
      }
    }
    buildingGroup.add(furnitureGroup);
    floorData.furnitureGroup = furnitureGroup;

    // Heatmap overlay (occupancy density visualization)
    const heatmapGeo = new THREE.PlaneGeometry(
      buildingWidth - 0.5,
      buildingDepth - 0.5,
      20,
      14,
    );
    const heatmapMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      vertexColors: true,
    });
    // Generate vertex colors based on occupancy + noise
    const heatColors = [];
    const posAttr = heatmapGeo.getAttribute("position");
    for (let v = 0; v < posAttr.count; v++) {
      const px = posAttr.getX(v);
      const pz = posAttr.getY(v); // plane is XY, we rotate to XZ
      const noise = Math.sin(px * 0.5) * Math.cos(pz * 0.5) * 0.3 + 0.5;
      const intensity = Math.min(
        1,
        Math.max(0, config.occupancy * noise + Math.random() * 0.15),
      );
      // Red = high occupancy, Green = low, Blue = medium
      if (intensity > 0.7) {
        heatColors.push(0.9, 0.2, 0.1);
      } else if (intensity > 0.4) {
        heatColors.push(0.9, 0.8, 0.1);
      } else {
        heatColors.push(0.1, 0.8, 0.3);
      }
    }
    heatmapGeo.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(heatColors, 3),
    );
    const heatmap = new THREE.Mesh(heatmapGeo, heatmapMat);
    heatmap.rotation.x = -Math.PI / 2;
    heatmap.position.set(0, yBase + 0.2, 0);
    heatmap.visible = showHeatmap;
    heatmap.userData = { floorIndex: i, type: "heatmap" };
    buildingGroup.add(heatmap);
    floorData.heatmap = heatmap;

    // Floor label (sprite)
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, 512, 64);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`F${i + 1}: ${config.name}`, 256, 42);
    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelMat = new THREE.SpriteMaterial({
      map: labelTexture,
      transparent: true,
    });
    const label = new THREE.Sprite(labelMat);
    label.scale.set(10, 1.25, 1);
    label.position.set(buildingWidth / 2 + 6, yBase + floorHeight / 2, 0);
    buildingGroup.add(label);
    floorData.label = label;

    floors.push(floorData);
  }
}

// ============ CAMERA (manual orbit, no OrbitControls) ============
function updateCameraPosition() {
  camera.position.x =
    cameraTarget.x + cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
  camera.position.y = cameraTarget.y + cameraRadius * Math.cos(cameraPhi);
  camera.position.z =
    cameraTarget.z + cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
  camera.lookAt(cameraTarget);
}

// ============ EVENTS (all inline) ============
function setupEvents() {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  renderer.domElement.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });
  renderer.domElement.addEventListener("mousemove", (e) => {
    // Drag to orbit
    if (isDragging) {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      cameraTheta -= dx * 0.005;
      cameraPhi = Math.max(
        0.2,
        Math.min(Math.PI - 0.2, cameraPhi + dy * 0.005),
      );
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
    // Hover detection
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const slabs = floors.map((f) => f.slab);
    const intersects = raycaster.intersectObjects(slabs);
    if (intersects.length > 0) {
      const fi = intersects[0].object.userData.floorIndex;
      if (hoveredFloor !== fi) {
        // Reset old hover
        if (hoveredFloor !== null && hoveredFloor !== selectedFloor) {
          floors[hoveredFloor].slab.material.emissive.setHex(0x000000);
        }
        hoveredFloor = fi;
        if (fi !== selectedFloor) {
          floors[fi].slab.material.emissive.setHex(0x222244);
        }
        renderer.domElement.style.cursor = "pointer";
      }
    } else {
      if (hoveredFloor !== null && hoveredFloor !== selectedFloor) {
        floors[hoveredFloor].slab.material.emissive.setHex(0x000000);
      }
      hoveredFloor = null;
      renderer.domElement.style.cursor = "default";
    }
  });
  renderer.domElement.addEventListener("mouseup", () => {
    isDragging = false;
  });
  renderer.domElement.addEventListener("wheel", (e) => {
    cameraRadius = Math.max(15, Math.min(120, cameraRadius + e.deltaY * 0.05));
  });

  // Click to select floor
  renderer.domElement.addEventListener("click", (e) => {
    if (
      Math.abs(e.clientX - lastMouseX) > 5 ||
      Math.abs(e.clientY - lastMouseY) > 5
    )
      return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const slabs = floors.map((f) => f.slab);
    const intersects = raycaster.intersectObjects(slabs);
    if (intersects.length > 0) {
      const fi = intersects[0].object.userData.floorIndex;
      selectFloor(fi);
    } else {
      deselectFloor();
    }
  });

  // UI buttons
  document
    .getElementById("btn-explode")
    .addEventListener("click", toggleExplode);
  document
    .getElementById("btn-furniture")
    .addEventListener("click", toggleFurniture);
  document
    .getElementById("btn-heatmap")
    .addEventListener("click", toggleHeatmap);
  document.getElementById("btn-reset").addEventListener("click", resetView);
}

// ============ FLOOR SELECTION (tightly coupled to everything) ============
function selectFloor(index) {
  if (selectedFloor === index) {
    deselectFloor();
    return;
  }
  // Reset previous
  if (selectedFloor !== null) {
    floors[selectedFloor].slab.material.emissive.setHex(0x000000);
    floors[selectedFloor].slab.material.opacity = 0.85;
    floors[selectedFloor].meshes.forEach((m) => {
      if (m.userData.type === "wall") m.material.opacity = 0.25;
    });
  }
  selectedFloor = index;
  // Highlight selected
  floors[index].slab.material.emissive.setHex(0x334466);
  floors[index].slab.material.opacity = 1.0;
  floors[index].meshes.forEach((m) => {
    if (m.userData.type === "wall") m.material.opacity = 0.5;
  });
  // Dim other floors
  floors.forEach((f, i) => {
    if (i !== index) {
      f.slab.material.opacity = 0.2;
      f.meshes.forEach((m) => {
        if (m.userData.type === "wall") m.material.opacity = 0.05;
      });
      f.furnitureGroup.visible = false;
      f.label.material.opacity = 0.3;
    } else {
      f.furnitureGroup.visible = showFurniture;
      f.label.material.opacity = 1;
    }
  });
  // Update info panel
  const config = FLOOR_CONFIGS[index];
  document.getElementById("info-panel").innerHTML =
    `<b>F${index + 1}: ${config.name}</b><br>` +
    `占用率: ${Math.round(config.occupancy * 100)}%<br>` +
    `房间: ${config.rooms.map((r) => r.label).join(", ")}`;
  // Move camera target
  cameraTarget.set(0, index * floorHeight + floorHeight / 2, 0);
  cameraRadius = 35;
}

function deselectFloor() {
  selectedFloor = null;
  floors.forEach((f) => {
    f.slab.material.emissive.setHex(0x000000);
    f.slab.material.opacity = 0.85;
    f.meshes.forEach((m) => {
      if (m.userData.type === "wall") m.material.opacity = 0.25;
    });
    f.furnitureGroup.visible = showFurniture;
    f.label.material.opacity = 1;
  });
  document.getElementById("info-panel").innerHTML = "建筑楼层查看器";
  cameraTarget.set(0, 8, 0);
  cameraRadius = 50;
}

// ============ TOGGLE FUNCTIONS (repetitive pattern) ============
function toggleExplode() {
  animatingExplode = true;
  explodeDirection = isExploded ? -1 : 1;
  isExploded = !isExploded;
  document.getElementById("btn-explode").classList.toggle("active", isExploded);
}

function toggleFurniture() {
  showFurniture = !showFurniture;
  floors.forEach((f) => {
    if (selectedFloor === null || f.index === selectedFloor) {
      f.furnitureGroup.visible = showFurniture;
    }
  });
  document
    .getElementById("btn-furniture")
    .classList.toggle("active", showFurniture);
}

function toggleHeatmap() {
  showHeatmap = !showHeatmap;
  floors.forEach((f) => {
    f.heatmap.visible = showHeatmap;
  });
  document
    .getElementById("btn-heatmap")
    .classList.toggle("active", showHeatmap);
}

function resetView() {
  selectedFloor = null;
  isExploded = false;
  animatingExplode = true;
  explodeDirection = -1;
  explodeProgress = isExploded ? 1 : explodeProgress;
  showFurniture = true;
  showHeatmap = false;
  cameraRadius = 50;
  cameraTheta = Math.PI / 4;
  cameraPhi = Math.PI / 3;
  cameraTarget.set(0, 8, 0);
  floors.forEach((f) => {
    f.slab.material.emissive.setHex(0x000000);
    f.slab.material.opacity = 0.85;
    f.meshes.forEach((m) => {
      if (m.userData.type === "wall") m.material.opacity = 0.25;
    });
    f.furnitureGroup.visible = true;
    f.heatmap.visible = false;
    f.label.material.opacity = 1;
  });
  document.getElementById("btn-explode").classList.remove("active");
  document.getElementById("btn-furniture").classList.add("active");
  document.getElementById("btn-heatmap").classList.remove("active");
  document.getElementById("info-panel").innerHTML = "建筑楼层查看器";
}

// ============ ANIMATION LOOP ============
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Explode animation
  if (animatingExplode) {
    explodeProgress += explodeDirection * delta * 2;
    if (explodeProgress >= 1) {
      explodeProgress = 1;
      animatingExplode = false;
    }
    if (explodeProgress <= 0) {
      explodeProgress = 0;
      animatingExplode = false;
    }

    const explodeSpacing = 3;
    floors.forEach((f, i) => {
      const targetY = f.yBase + i * explodeSpacing * explodeProgress;
      // Move all meshes for this floor
      f.slab.position.y = targetY;
      f.meshes.forEach((m) => {
        if (m.userData.type === "wall") {
          m.position.y = targetY + floorHeight / 2;
        }
      });
      f.furnitureGroup.position.y = i * explodeSpacing * explodeProgress;
      f.heatmap.position.y = targetY + 0.2;
      f.label.position.y = targetY + floorHeight / 2;
    });
  }

  // Server LED blink animation (floor 4)
  if (floors[4]) {
    const serverFurniture = floors[4].furnitureGroup;
    serverFurniture.children.forEach((child) => {
      if (
        child.geometry &&
        child.geometry.parameters &&
        child.geometry.parameters.width === 0.05
      ) {
        if (Math.random() < 0.02) {
          child.material.color.setHex(
            Math.random() > 0.3 ? 0x00ff00 : 0xff4444,
          );
        }
      }
    });
  }

  updateCameraPosition();
  renderer.render(scene, camera);
}

// ============ START ============
init();
animate();
