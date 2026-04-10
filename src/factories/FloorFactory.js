import * as THREE from "three";
import { BUILDING_CONSTANTS } from "../config/BuildingConfig.js";
import { generateFurniture } from "./FurnitureGenerators.js";

export function createFloor(index, config) {
  const yBase = index * BUILDING_CONSTANTS.FLOOR_HEIGHT;
  const floorData = { index, config, yBase, meshes: [] };

  floorData.slab = createSlab(yBase, config, index);
  floorData.meshes.push(floorData.slab);

  const walls = createWalls(yBase, index);
  floorData.meshes.push(...walls);

  floorData.furnitureGroup = createFurnitureGroup(
    config.furnitureType,
    yBase,
    config.rooms,
    index,
  );

  floorData.heatmap = createHeatmap(
    yBase,
    config.occupancy,
    BUILDING_CONSTANTS.BUILDING_WIDTH,
    BUILDING_CONSTANTS.BUILDING_DEPTH,
    index,
  );

  floorData.label = createFloorLabel(
    yBase,
    index,
    config.name,
    BUILDING_CONSTANTS.BUILDING_WIDTH,
    BUILDING_CONSTANTS.FLOOR_HEIGHT,
  );

  return floorData;
}

export function createSlab(yBase, config, index) {
  const slabGeo = new THREE.BoxGeometry(
    BUILDING_CONSTANTS.BUILDING_WIDTH,
    0.3,
    BUILDING_CONSTANTS.BUILDING_DEPTH,
  );
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
  slab.userData = { floorIndex: index, type: "slab" };
  return slab;
}

export function createWalls(yBase, index) {
  const walls = [];
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xddeeff,
    roughness: 0.3,
    metalness: 0.05,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  });
  const floorHeight = BUILDING_CONSTANTS.FLOOR_HEIGHT;
  const buildingWidth = BUILDING_CONSTANTS.BUILDING_WIDTH;
  const buildingDepth = BUILDING_CONSTANTS.BUILDING_DEPTH;

  const frontWallGeo = new THREE.PlaneGeometry(
    buildingWidth,
    floorHeight - 0.3,
  );
  const frontWall = new THREE.Mesh(frontWallGeo, wallMat.clone());
  frontWall.position.set(0, yBase + floorHeight / 2, buildingDepth / 2);
  frontWall.userData = { floorIndex: index, type: "wall" };
  walls.push(frontWall);

  const backWall = new THREE.Mesh(frontWallGeo.clone(), wallMat.clone());
  backWall.position.set(0, yBase + floorHeight / 2, -buildingDepth / 2);
  backWall.rotation.y = Math.PI;
  backWall.userData = { floorIndex: index, type: "wall" };
  walls.push(backWall);

  const sideWallGeo = new THREE.PlaneGeometry(
    buildingDepth,
    floorHeight - 0.3,
  );
  const leftWall = new THREE.Mesh(sideWallGeo, wallMat.clone());
  leftWall.position.set(-buildingWidth / 2, yBase + floorHeight / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.userData = { floorIndex: index, type: "wall" };
  walls.push(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeo.clone(), wallMat.clone());
  rightWall.position.set(buildingWidth / 2, yBase + floorHeight / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.userData = { floorIndex: index, type: "wall" };
  walls.push(rightWall);

  return walls;
}

export function createFurnitureGroup(furnitureType, yBase, rooms, index) {
  const group = new THREE.Group();
  group.userData = { floorIndex: index, type: "furniture" };
  const furnitureItems = generateFurniture(furnitureType, yBase, rooms);
  furnitureItems.forEach((item) => group.add(item));
  return group;
}

export function createHeatmap(
  yBase,
  occupancy,
  buildingWidth,
  buildingDepth,
  index,
) {
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

  const heatColors = [];
  const posAttr = heatmapGeo.getAttribute("position");
  for (let v = 0; v < posAttr.count; v++) {
    const px = posAttr.getX(v);
    const pz = posAttr.getY(v);
    const noise = Math.sin(px * 0.5) * Math.cos(pz * 0.5) * 0.3 + 0.5;
    const intensity = Math.min(
      1,
      Math.max(0, occupancy * noise + Math.random() * 0.15),
    );
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
  heatmap.visible = false;
  heatmap.userData = { floorIndex: index, type: "heatmap" };
  return heatmap;
}

export function createFloorLabel(yBase, index, name, buildingWidth, floorHeight) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`F${index + 1}: ${name}`, 256, 42);
  const labelTexture = new THREE.CanvasTexture(canvas);
  const labelMat = new THREE.SpriteMaterial({
    map: labelTexture,
    transparent: true,
  });
  const label = new THREE.Sprite(labelMat);
  label.scale.set(10, 1.25, 1);
  label.position.set(buildingWidth / 2 + 6, yBase + floorHeight / 2, 0);
  return label;
}
