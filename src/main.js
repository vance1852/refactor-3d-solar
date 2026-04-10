import * as THREE from "three";
import { BUILDING_CONSTANTS, FLOOR_CONFIGS } from "./config/BuildingConfig.js";
import { createFloor } from "./factories/FloorFactory.js";
import { OrbitCamera } from "./modules/OrbitCamera.js";
import { FloorSelectionManager } from "./modules/FloorSelectionManager.js";
import * as Explode from "./modules/ExplodeAnimation.js";
import {
  createScene,
  createCamera,
  createRenderer,
  setupLights,
  createGround,
  createGridHelper,
} from "./core/SceneSetup.js";

let scene, camera, renderer, orbitCamera, raycaster, mouse;
let buildingGroup;
let floors = [];
let floorSelectionManager;
let isExploded = false;
let explodeProgress = 0;
let animatingExplode = false;
let explodeDirection = 1;
let showFurniture = true;
let showHeatmap = false;
let lastClickPos = { x: 0, y: 0 };
const clock = new THREE.Clock();

function init() {
  scene = createScene();
  camera = createCamera(window.innerWidth / window.innerHeight);
  renderer = createRenderer();
  document.body.appendChild(renderer.domElement);

  orbitCamera = new OrbitCamera(camera, renderer.domElement);
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  setupLights(scene);
  createGround(scene);
  createGridHelper(scene);

  buildingGroup = new THREE.Group();
  scene.add(buildingGroup);

  createBuilding();
  setupFloorSelection();
  setupEventListeners();
}

function createBuilding() {
  for (let i = 0; i < BUILDING_CONSTANTS.FLOOR_COUNT; i++) {
    const config = FLOOR_CONFIGS[i];
    const floorData = createFloor(i, config);

    buildingGroup.add(floorData.slab);
    floorData.meshes.forEach((mesh) => buildingGroup.add(mesh));
    buildingGroup.add(floorData.furnitureGroup);
    buildingGroup.add(floorData.heatmap);
    buildingGroup.add(floorData.label);

    floors.push(floorData);
  }
}

function setupFloorSelection() {
  floorSelectionManager = new FloorSelectionManager({
    onFloorSelect: (index, config) => {
      floors[index].furnitureGroup.visible = showFurniture;
      document.getElementById("info-panel").innerHTML =
        `<b>F${index + 1}: ${config.name}</b><br>` +
        `占用率: ${Math.round(config.occupancy * 100)}%<br>` +
        `房间: ${config.rooms.map((r) => r.label).join(", ")}`;

      orbitCamera.setTarget(
        0,
        index * BUILDING_CONSTANTS.FLOOR_HEIGHT + BUILDING_CONSTANTS.FLOOR_HEIGHT / 2,
        0,
      );
      orbitCamera.radius = 35;
    },
    onFloorDeselect: () => {
      floors.forEach((f) => {
        f.furnitureGroup.visible = showFurniture;
      });
      document.getElementById("info-panel").innerHTML = "建筑楼层查看器";
      orbitCamera.setTarget(0, 8, 0);
      orbitCamera.radius = 50;
    },
  });
  floorSelectionManager.setFloors(floors);
}

function setupEventListeners() {
  window.addEventListener("resize", () => {
    orbitCamera.handleResize(window.innerWidth / window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  renderer.domElement.addEventListener("mousedown", (e) => {
    lastClickPos = { x: e.clientX, y: e.clientY };
  });

  renderer.domElement.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const slabs = floors.map((f) => f.slab);
    const intersects = raycaster.intersectObjects(slabs);

    if (intersects.length > 0) {
      const fi = intersects[0].object.userData.floorIndex;
      const hasHover = floorSelectionManager.hoverFloor(fi);
      renderer.domElement.style.cursor = hasHover !== false ? "pointer" : "default";
    } else {
      floorSelectionManager.unhoverFloor();
      renderer.domElement.style.cursor = "default";
    }
  });

  renderer.domElement.addEventListener("wheel", () => {});

  renderer.domElement.addEventListener("click", (e) => {
    if (
      Math.abs(e.clientX - lastClickPos.x) > 5 ||
      Math.abs(e.clientY - lastClickPos.y) > 5
    ) {
      return;
    }

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const slabs = floors.map((f) => f.slab);
    const intersects = raycaster.intersectObjects(slabs);

    if (intersects.length > 0) {
      const fi = intersects[0].object.userData.floorIndex;
      floorSelectionManager.selectFloor(fi);
    } else {
      floorSelectionManager.deselectFloor();
    }
  });

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

function toggleExplode() {
  animatingExplode = true;
  explodeDirection = isExploded ? -1 : 1;
  isExploded = !isExploded;
  document.getElementById("btn-explode").classList.toggle("active", isExploded);
}

function toggleFurniture() {
  showFurniture = !showFurniture;
  const selected = floorSelectionManager.getSelectedFloor();
  floors.forEach((f, i) => {
    if (selected === null || i === selected) {
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
  isExploded = false;
  animatingExplode = true;
  explodeDirection = -1;

  showFurniture = true;
  showHeatmap = false;

  floorSelectionManager.resetAllFloors(showFurniture);
  orbitCamera.reset();

  floors.forEach((f) => {
    f.heatmap.visible = false;
  });

  document.getElementById("btn-explode").classList.remove("active");
  document.getElementById("btn-furniture").classList.add("active");
  document.getElementById("btn-heatmap").classList.remove("active");
  document.getElementById("info-panel").innerHTML = "建筑楼层查看器";
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (animatingExplode) {
    const state = Explode.updateExplodeAnimationState(
      explodeProgress,
      explodeDirection,
      delta,
    );
    explodeProgress = state.progress;
    animatingExplode = state.animating;

    floors.forEach((f, i) => {
      const slabPos = Explode.calculateSlabPosition(f.yBase, i, explodeProgress);
      f.slab.position.y = slabPos.y;

      const wallY = Explode.calculateWallPosition(
        f.yBase,
        i,
        explodeProgress,
      );
      f.meshes.forEach((m) => {
        if (m.userData.type === "wall") {
          m.position.y = wallY;
        }
      });

      const furnitureOffset = Explode.calculateExplodeOffset(i, explodeProgress);
      f.furnitureGroup.position.y = furnitureOffset;

      const heatmapPos = Explode.calculateHeatmapPosition(
        f.yBase,
        i,
        explodeProgress,
      );
      f.heatmap.position.y = heatmapPos.y;

      const labelPos = Explode.calculateLabelPosition(
        f.yBase,
        i,
        explodeProgress,
      );
      f.label.position.y = labelPos.y;
    });
  }

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
