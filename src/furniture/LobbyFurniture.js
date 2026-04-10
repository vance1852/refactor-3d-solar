/**
 * 大堂家具生成器
 */

import { FurnitureBase } from "./FurnitureBase.js";

export class LobbyFurniture extends FurnitureBase {
  buildFurniture() {
    this.createReceptionDesk();
    this.createSofas();
    this.createPlants();
  }

  createReceptionDesk() {
    this.createBox(6, 1.2, 1.5, 0x8b4513, 0, 0.75, -3, { roughness: 0.6 });
  }

  createSofas() {
    for (let s = 0; s < 3; s++) {
      this.createBox(2.5, 0.8, 1, 0x4a6741, -6 + s * 6, 0.55, 3, { roughness: 0.7 });
    }
  }

  createPlants() {
    for (let p = 0; p < 4; p++) {
      const x = -7 + p * 4.5;
      const z = 5;
      this.createCylinder(0.3, 0.4, 0.6, 0x8b4513, x, 0.45, z);
      this.createSphere(0.6, 0x228b22, x, 1.1, z);
    }
  }
}
