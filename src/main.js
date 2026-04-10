import * as THREE from "three";
import {
  FLOOR_CONFIGS,
  BUILDING_CONSTANTS,
} from "./config/building-constants.js";
import {
  createFurniture,
  createFloorSlab,
  createWalls,
  createFloorLabel,
} from "./modules/floor-factory.js";
import { OrbitCamera } from "./modules/orbit-camera.js";
import { createHeatmapMesh, getHeatmapColor } from "./modules/heatmap.js";
import {
  ExplodeViewController,
  calculateExplodedPosition,
} from "./modules/explode-view.js";
import { FloorStateManager } from "./modules/floor-state.js";

const { FLOOR_COUNT, FLOOR_HEIGHT } = BUILDING_CONSTANTS;

let scene, camera, renderer, raycaster, mouse, orbitCamera, buildingGroup;
let floorStateManager = new FloorStateManager();
let explodeAnimation = new ExplodeViewController();
let clock = new THREE.Clock();
let lastMouseX = 0,
  lastMouseY = 0;

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    500,
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  orbitCamera = new OrbitCamera(camera, renderer.domElement);
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  setupLights();
  setupGroundAndGrid();

  buildingGroup = new THREE.Group();
  scene.add(buildingGroup);

  const floors = createBuilding();
  floorStateManager.registerFloors(floors);

  setupEvents();
}

function setupLights() {
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
}

function setupGroundAndGrid() {
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

  const grid = new THREE.GridHelper(100, 50, 0x333355, 0x222244);
  grid.position.y = 0;
  scene.add(grid);
}

function createBuilding() {
  const floors = [];

  for (let i = 0; i < FLOOR_COUNT; i++) {
    const config = FLOOR_CONFIGS[i];
    const yBase = i * FLOOR_HEIGHT;
    const floorData = { index: i, config, meshes: [], yBase };

    const { slab } = createFloorSlab(config, i);
    buildingGroup.add(slab);
    floorData.slab = slab;
    floorData.meshes.push(slab);

    const walls = createWalls(yBase, i);
    walls.forEach((wall) => {
      buildingGroup.add(wall);
      floorData.meshes.push(wall);
    });

    const furnitureGroup = createFurniture(config, yBase);
    furnitureGroup.userData = { floorIndex: i, type: "furniture" };
    buildingGroup.add(furnitureGroup);
    floorData.furnitureGroup = furnitureGroup;

    const heatmap = createHeatmapMesh(config.occupancy, yBase);
    heatmap.userData = { floorIndex: i, type: "heatmap" };
    buildingGroup.add(heatmap);
    floorData.heatmap = heatmap;

    const label = createFloorLabel(config, i, yBase);
    buildingGroup.add(label);
    floorData.label = label;

    floors.push(floorData);
  }

  return floors;
}

function setupEvents() {
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  renderer.domElement.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });

  renderer.domElement.addEventListener("mousemove", handleMouseMove);
  renderer.domElement.addEventListener("click", handleClick);

  document.getElementById("btn-explode").addEventListener("click", () => {
    const isActive = explodeAnimation.toggle();
    document.getElementById("btn-explode").classList.toggle("active", isActive);
  });
  document.getElementById("btn-furniture").addEventListener("click", () => {
    const isActive = floorStateManager.toggleFurniture();
    document
      .getElementById("btn-furniture")
      .classList.toggle("active", isActive);
  });
  document.getElementById("btn-heatmap").addEventListener("click", () => {
    const isActive = floorStateManager.toggleHeatmap();
    document.getElementById("btn-heatmap").classList.toggle("active", isActive);
  });
  document.getElementById("btn-reset").addEventListener("click", resetView);
}

function handleMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const floors = floorStateManager.state.floors;
  if (floors.length === 0) return;

  const slabs = floors.map((f) => f.slab);
  const intersects = raycaster.intersectObjects(slabs);

  if (intersects.length > 0) {
    const fi = intersects[0].object.userData.floorIndex;
    floorStateManager.setHoveredFloor(fi);
    renderer.domElement.style.cursor = "pointer";
  } else {
    floorStateManager.setHoveredFloor(null);
    renderer.domElement.style.cursor = "default";
  }
}

function handleClick(e) {
  if (
    Math.abs(e.clientX - lastMouseX) > 5 ||
    Math.abs(e.clientY - lastMouseY) > 5
  )
    return;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const floors = floorStateManager.state.floors;
  const slabs = floors.map((f) => f.slab);
  const intersects = raycaster.intersectObjects(slabs);

  if (intersects.length > 0) {
    const fi = intersects[0].object.userData.floorIndex;
    const config = floorStateManager.selectFloor(fi, orbitCamera);
    if (config) {
      document.getElementById("info-panel").innerHTML =
        `<b>F${fi + 1}: ${config.name}</b><br>` +
        `占用率: ${Math.round(config.occupancy * 100)}%<br>` +
        `房间: ${config.rooms.map((r) => r.label).join(", ")}`;
    } else {
      document.getElementById("info-panel").innerHTML = "建筑楼层查看器";
    }
  } else {
    floorStateManager.deselectFloor(orbitCamera);
    document.getElementById("info-panel").innerHTML = "建筑楼层查看器";
  }
}

function resetView() {
  explodeAnimation.reset();
  floorStateManager.resetAll();
  orbitCamera.reset();
  document.getElementById("btn-explode").classList.remove("active");
  document.getElementById("btn-furniture").classList.add("active");
  document.getElementById("btn-heatmap").classList.remove("active");
  document.getElementById("info-panel").innerHTML = "建筑楼层查看器";
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  const floors = floorStateManager.state.floors;

  explodeAnimation.update(delta);
  const progress = explodeAnimation.progress;
  floors.forEach((f, i) => {
    const pos = calculateExplodedPosition(i, f.yBase, progress);
    f.slab.position.y = pos.slabY;
    f.meshes.forEach((m) => {
      if (m.userData?.type === "wall") {
        m.position.y = pos.wallY;
      }
    });
    f.furnitureGroup.position.y = pos.furnitureY;
    f.heatmap.position.y = pos.heatmapY;
    f.label.position.y = pos.labelY;
  });

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

  orbitCamera.updatePosition();
  renderer.render(scene, camera);
}

init();
animate();
