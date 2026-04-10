import * as THREE from "three";

function createLobbyFurniture(yBase) {
  const furniture = [];
  const deskGeo = new THREE.BoxGeometry(6, 1.2, 1.5);
  const deskMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.6,
  });
  const desk = new THREE.Mesh(deskGeo, deskMat);
  desk.position.set(0, yBase + 0.75, -3);
  desk.castShadow = true;
  furniture.push(desk);

  for (let s = 0; s < 3; s++) {
    const sofaGeo = new THREE.BoxGeometry(2.5, 0.8, 1);
    const sofaMat = new THREE.MeshStandardMaterial({
      color: 0x4a6741,
      roughness: 0.7,
    });
    const sofa = new THREE.Mesh(sofaGeo, sofaMat);
    sofa.position.set(-6 + s * 6, yBase + 0.55, 3);
    sofa.castShadow = true;
    furniture.push(sofa);
  }

  for (let p = 0; p < 4; p++) {
    const potGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 8);
    const potMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(-7 + p * 4.5, yBase + 0.45, 5);
    furniture.push(pot);
    const plantGeo = new THREE.SphereGeometry(0.6, 8, 8);
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const plant = new THREE.Mesh(plantGeo, plantMat);
    plant.position.set(-7 + p * 4.5, yBase + 1.1, 5);
    furniture.push(plant);
  }

  return furniture;
}

function createOfficeFurniture(yBase) {
  const furniture = [];
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
      furniture.push(d);

      const cGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
      const cMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const c = new THREE.Mesh(cGeo, cMat);
      c.position.set(-7 + col * 3.5, yBase + 0.4, -4 + row * 4 + 0.8);
      furniture.push(c);
    }
  }
  return furniture;
}

function createMeetingFurniture(yBase, rooms) {
  const furniture = [];
  rooms.forEach((room) => {
    const tGeo = new THREE.BoxGeometry(room.w * 0.6, 0.8, room.d * 0.5);
    const tMat = new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.4,
    });
    const t = new THREE.Mesh(tGeo, tMat);
    t.position.set(room.x, yBase + 0.55, room.z);
    t.castShadow = true;
    furniture.push(t);

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
      furniture.push(ch);
    }
  });
  return furniture;
}

function createServerFurniture(yBase) {
  const furniture = [];
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
      furniture.push(rack);

      for (let l = 0; l < 5; l++) {
        const ledGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const ledMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.3 ? 0x00ff00 : 0xff0000,
        });
        const led = new THREE.Mesh(ledGeo, ledMat.clone());
        led.material.color.setHex(
          Math.random() > 0.3 ? 0x00ff00 : 0xff4444,
        );
        led.position.set(
          -6 + c * 3 + 0.45,
          yBase + 0.5 + l * 0.4,
          -3 + r * 2.5 + 0.35,
        );
        furniture.push(led);
      }
    }
  }
  return furniture;
}

function createGardenFurniture(yBase) {
  const furniture = [];
  for (let t = 0; t < 6; t++) {
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(-6 + t * 2.5, yBase + 0.9, Math.sin(t) * 3);
    furniture.push(trunk);
    const canopyGeo = new THREE.SphereGeometry(1, 8, 8);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x228b22 + Math.floor(Math.random() * 0x003300),
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(-6 + t * 2.5, yBase + 2.2, Math.sin(t) * 3);
    canopy.castShadow = true;
    furniture.push(canopy);
  }

  for (let b = 0; b < 3; b++) {
    const benchGeo = new THREE.BoxGeometry(2, 0.4, 0.6);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0xa0522d });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(-4 + b * 4, yBase + 0.35, -4);
    furniture.push(bench);
  }

  return furniture;
}

export const FURNITURE_GENERATORS = {
  lobby: createLobbyFurniture,
  office: createOfficeFurniture,
  meeting: createMeetingFurniture,
  server: createServerFurniture,
  garden: createGardenFurniture,
};

export function generateFurniture(furnitureType, yBase, rooms = []) {
  const generator = FURNITURE_GENERATORS[furnitureType];
  if (!generator) {
    console.warn(`Unknown furniture type: ${furnitureType}`);
    return [];
  }
  return generator(yBase, rooms);
}
