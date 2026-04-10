import {
  FLOOR_CONFIGS,
  BUILDING_CONSTANTS,
} from "../config/building-constants.js";
export class FloorStateManager {
  constructor(floors) {
    this.floors = floors;
    this.selectedFloor = null;
    this.hoveredFloor = null;
    this.showFurniture = true;
    this.showHeatmap = false;
  }
  selectFloor(index) {
    if (this.selectedFloor === index) {
      this.deselectFloor();
      return null;
    }
    if (this.selectedFloor !== null) {
      this._resetFloorAppearance(this.selectedFloor);
    }
    this.selectedFloor = index;
    this._highlightFloor(index);
    this._dimOtherFloors(index);
    return FLOOR_CONFIGS[index];
  }
  deselectFloor() {
    if (this.selectedFloor === null) return;
    this._resetAllFloorsAppearance();
    this.selectedFloor = null;
  }
  _resetFloorAppearance(index) {
    const f = this.floors[index];
    f.slab.material.emissive.setHex(0x000000);
    f.slab.material.opacity = 0.85;
    f.meshes.forEach((m) => {
      if (m.userData.type === "wall") m.material.opacity = 0.25;
    });
  }
  _highlightFloor(index) {
    const f = this.floors[index];
    f.slab.material.emissive.setHex(0x334466);
    f.slab.material.opacity = 1;
    f.meshes.forEach((m) => {
      if (m.userData.type === "wall") m.material.opacity = 0.5;
    });
  }
  _dimOtherFloors(index) {
    this.floors.forEach((f, i) => {
      if (i !== index) {
        f.slab.material.opacity = 0.2;
        f.meshes.forEach((m) => {
          if (m.userData.type === "wall") m.material.opacity = 0.05;
        });
        f.furnitureGroup.visible = false;
        f.label.material.opacity = 0.3;
      } else {
        f.furnitureGroup.visible = this.showFurniture;
        f.label.material.opacity = 1;
      }
    });
  }
  _resetAllFloorsAppearance() {
    this.floors.forEach((f) => {
      f.slab.material.emissive.setHex(0x000000);
      f.slab.material.opacity = 0.85;
      f.meshes.forEach((m) => {
        if (m.userData.type === "wall") m.material.opacity = 0.25;
      });
      f.furnitureGroup.visible = this.showFurniture;
      f.label.material.opacity = 1;
    });
  }
  setHoveredFloor(index) {
    if (
      this.hoveredFloor !== null &&
      this.hoveredFloor !== this.selectedFloor
    ) {
      this.floors[this.hoveredFloor].slab.material.emissive.setHex(0x000000);
    }
    this.hoveredFloor = index;
    if (index !== null && index !== this.selectedFloor) {
      this.floors[index].slab.material.emissive.setHex(0x222244);
    }
    return index !== null;
  }
  toggleFurniture() {
    this.showFurniture = !this.showFurniture;
    this.floors.forEach((f, i) => {
      if (this.selectedFloor === null || i === this.selectedFloor) {
        f.furnitureGroup.visible = this.showFurniture;
      }
    });
    return this.showFurniture;
  }
  toggleHeatmap() {
    this.showHeatmap = !this.showHeatmap;
    this.floors.forEach((f) => {
      f.heatmap.visible = this.showHeatmap;
    });
    return this.showHeatmap;
  }
  reset() {
    this.showFurniture = true;
    this.showHeatmap = false;
    this.deselectFloor();
    this.floors.forEach((f) => {
      f.heatmap.visible = false;
    });
  }
  getCameraTargetForSelectedFloor() {
    if (this.selectedFloor === null) {
      return { x: 0, y: 8, z: 0, radius: 50 };
    }
    return {
      x: 0,
      y:
        this.selectedFloor * BUILDING_CONSTANTS.FLOOR_HEIGHT +
        BUILDING_CONSTANTS.FLOOR_HEIGHT / 2,
      z: 0,
      radius: 35,
    };
  }
}
