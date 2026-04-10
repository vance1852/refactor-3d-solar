/**
 * 会议室家具生成器
 */

import { FurnitureBase } from "./FurnitureBase.js";

export class MeetingFurniture extends FurnitureBase {
  buildFurniture() {
    this.config.rooms.forEach((room) => {
      this.createConferenceTable(room);
      this.createChairsAroundTable(room);
    });
  }

  createConferenceTable(room) {
    this.createBox(
      room.w * 0.6,
      0.8,
      room.d * 0.5,
      0x654321,
      room.x,
      0.55,
      room.z,
      { roughness: 0.4 }
    );
  }

  createChairsAroundTable(room) {
    for (let ci = 0; ci < 6; ci++) {
      const angle = (ci / 6) * Math.PI * 2;
      const x = room.x + Math.cos(angle) * (room.w * 0.35);
      const z = room.z + Math.sin(angle) * (room.d * 0.3);
      this.createBox(0.5, 0.5, 0.5, 0x444444, x, 0.4, z);
    }
  }
}
