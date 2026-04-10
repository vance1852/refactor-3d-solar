/**
 * 花园家具生成器
 */

import { FurnitureBase } from "./FurnitureBase.js";

export class GardenFurniture extends FurnitureBase {
  buildFurniture() {
    this.createTrees();
    this.createBenches();
  }

  createTrees() {
    for (let t = 0; t < 6; t++) {
      const x = -6 + t * 2.5;
      const z = Math.sin(t) * 3;
      this.createCylinder(0.15, 0.2, 1.5, 0x8b4513, x, 0.9, z);
      const colorVariation = Math.floor(Math.random() * 0x003300);
      this.createSphere(1, 0x228b22 + colorVariation, x, 2.2, z);
    }
  }

  createBenches() {
    for (let b = 0; b < 3; b++) {
      this.createBox(2, 0.4, 0.6, 0xa0522d, -4 + b * 4, 0.35, -4);
    }
  }
}
