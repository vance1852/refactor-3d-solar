/**
 * 服务器机房家具生成器
 */

import * as THREE from "three";
import { FurnitureBase } from "./FurnitureBase.js";

export class ServerFurniture extends FurnitureBase {
  buildFurniture() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const x = -6 + c * 3;
        const z = -3 + r * 2.5;
        this.createServerRack(x, z);
        this.createLEDs(x, z);
      }
    }
  }

  createServerRack(x, z) {
    const geometry = new THREE.BoxGeometry(1, 2.5, 0.8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2f2f2f,
      metalness: 0.5,
      roughness: 0.3,
    });
    const rack = new THREE.Mesh(geometry, material);
    rack.position.set(x, this.yBase + 1.4, z);
    rack.castShadow = true;
    this.group.add(rack);
  }

  createLEDs(x, z) {
    const ledGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    for (let l = 0; l < 5; l++) {
      const ledMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.3 ? 0x00ff00 : 0xff4444,
      });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(x + 0.45, this.yBase + 0.5 + l * 0.4, z + 0.35);
      led.userData.isLED = true;
      this.group.add(led);
    }
  }
}
