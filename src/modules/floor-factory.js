import * as THREE from "three";
import { BUILDING_CONSTANTS } from "../config/building-constants.js";

export const furnitureStrategies = {
  lobby: (yBase) => {
    const group = new THREE.Group();
    const deskGeo = new THREE.BoxGeometry(6, 1.2, 1.5);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.6,
    });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, yBase + 0.75, -3);
    desk.castShadow = true;
    group.add(desk);

    for (let s = 0; s < 3; s++) {
      const sofaGeo = new THREE.BoxGeometry(2.5, 0.8, 1);
      const sofaMat = new THREE.MeshStandardMaterial({
        color: 0x4a6741,
        roughness: 0.7,
      });
      const sofa = new THREE.Mesh(sofaGeo, sofaMat);
      sofa.position.set(-6 + s * 6, yBase + 0.55, 3);
      sofa.castShadow = true;
      group.add(sofa);
    }

    for (let p = 0; p < 4; p++) {
      const potGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 8);
      const potMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.set(-7 + p * 4.5, yBase + 0.45, 5);
      group.add(pot);
      const plantGeo = new THREE.SphereGeometry(0.6, 8, 8);
      const plantMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
      const plant = new THREE.Mesh(plantGeo, plantMat);
      plant.position.set(-7 + p * 4.5, yBase + 1.1, 5);
      group.add(plant);
    }
    return group;
  },

  office: (yBase) => {
    const group = new THREE.Group();
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
        group.add(d);
        const cGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
        const cMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const c = new THREE.Mesh(cGeo, cMat);
        c.position.set(-7 + col * 3.5, yBase + 0.4, -4 + row * 4 + 0.8);
        group.add(c);
      }
    }
    return group;
  },

  meeting: (yBase, config) => {
    const group = new THREE.Group();
    config.rooms.forEach((room) => {
      const tGeo = new THREE.BoxGeometry(room.w * 0.6, 0.8, room.d * 0.5);
      const tMat = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.4,
      });
      const t = new THREE.Mesh(tGeo, tMat);
      t.position.set(room.x, yBase + 0.55, room.z);
      t.castShadow = true;
      group.add(t);
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
        group.add(ch);
      }
    });
    return group;
  },

  server: (yBase) => {
    const group = new THREE.Group();
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
        group.add(rack);
        const ledGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        for (let l = 0; l < 5; l++) {
          const ledMat = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.3 ? 0x00ff00 : 0xff0000,
          });
          const led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(
            -6 + c * 3 + 0.45,
            yBase + 0.5 + l * 0.4,
            -3 + r * 2.5 + 0.35,
          );
          group.add(led);
        }
      }
    }
    return group;
  },

  garden: (yBase) => {
    const group = new THREE.Group();
    for (let t = 0; t < 6; t++) {
      const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(-6 + t * 2.5, yBase + 0.9, Math.sin(t) * 3);
      group.add(trunk);
      const canopyGeo = new THREE.SphereGeometry(1, 8, 8);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x228b22 + Math.floor(Math.random() * 0x003300),
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(-6 + t * 2.5, yBase + 2.2, Math.sin(t) * 3);
      canopy.castShadow = true;
      group.add(canopy);
    }
    for (let b = 0; b < 3; b++) {
      const benchGeo = new THREE.BoxGeometry(2, 0.4, 0.6);
      const benchMat = new THREE.MeshStandardMaterial({ color: 0xa0522d });
      const bench = new THREE.Mesh(benchGeo, benchMat);
      bench.position.set(-4 + b * 4, yBase + 0.35, -4);
      group.add(bench);
    }
    return group;
  },
};

export function createFloorSlab(config, index) {
  const { FLOOR_HEIGHT, BUILDING_WIDTH, BUILDING_DEPTH } = BUILDING_CONSTANTS;
  const yBase = index * FLOOR_HEIGHT;

  const slabGeo = new THREE.BoxGeometry(BUILDING_WIDTH, 0.3, BUILDING_DEPTH);
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

  return { slab, yBase };
}

export function createWalls(yBase = 0, index = 0) {
  const { FLOOR_HEIGHT, BUILDING_WIDTH, BUILDING_DEPTH } = BUILDING_CONSTANTS;
  const meshes = [];

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xddeeff,
    roughness: 0.3,
    metalness: 0.05,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  });

  const frontWallGeo = new THREE.PlaneGeometry(
    BUILDING_WIDTH,
    FLOOR_HEIGHT - 0.3,
  );
  const frontWall = new THREE.Mesh(frontWallGeo, wallMat.clone());
  frontWall.position.set(0, yBase + FLOOR_HEIGHT / 2, BUILDING_DEPTH / 2);
  frontWall.userData = { floorIndex: index, type: "wall" };
  meshes.push(frontWall);

  const backWall = new THREE.Mesh(frontWallGeo.clone(), wallMat.clone());
  backWall.position.set(0, yBase + FLOOR_HEIGHT / 2, -BUILDING_DEPTH / 2);
  backWall.rotation.y = Math.PI;
  backWall.userData = { floorIndex: index, type: "wall" };
  meshes.push(backWall);

  const sideWallGeo = new THREE.PlaneGeometry(
    BUILDING_DEPTH,
    FLOOR_HEIGHT - 0.3,
  );
  const leftWall = new THREE.Mesh(sideWallGeo, wallMat.clone());
  leftWall.position.set(-BUILDING_WIDTH / 2, yBase + FLOOR_HEIGHT / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.userData = { floorIndex: index, type: "wall" };
  meshes.push(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeo.clone(), wallMat.clone());
  rightWall.position.set(BUILDING_WIDTH / 2, yBase + FLOOR_HEIGHT / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.userData = { floorIndex: index, type: "wall" };
  meshes.push(rightWall);

  return meshes;
}

export function createFurniture(config, index, yBase) {
  const strategy = furnitureStrategies[config.furnitureType];
  if (!strategy) return new THREE.Group();
  const furnitureGroup = strategy(yBase, config);
  furnitureGroup.userData = { floorIndex: index, type: "furniture" };
  return furnitureGroup;
}

export function createFloorLabel(config, index, yBase) {
  const { FLOOR_HEIGHT, BUILDING_WIDTH } = BUILDING_CONSTANTS;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`F${index + 1}: ${config.name}`, 256, 42);
  const labelTexture = new THREE.CanvasTexture(canvas);
  const labelMat = new THREE.SpriteMaterial({
    map: labelTexture,
    transparent: true,
  });
  const label = new THREE.Sprite(labelMat);
  label.scale.set(10, 1.25, 1);
  label.position.set(BUILDING_WIDTH / 2 + 6, yBase + FLOOR_HEIGHT / 2, 0);
  return label;
}
