/**
 * 办公家具生成器
 */

import { FurnitureBase } from "./FurnitureBase.js";

export class OfficeFurniture extends FurnitureBase {
  buildFurniture() {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const x = -7 + col * 3.5;
        const z = -4 + row * 4;
        this.createDesk(x, z);
        this.createChair(x, z + 0.8);
      }
    }
  }

  createDesk(x, z) {
    this.createBox(1.8, 0.8, 1, 0xb8860b, x, 0.55, z, { roughness: 0.5 });
  }

  createChair(x, z) {
    this.createBox(0.6, 0.5, 0.6, 0x333333, x, 0.4, z);
  }
}
