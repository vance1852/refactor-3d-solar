import { BUILDING_CONSTANTS } from "../config/BuildingConfig.js";

export class FloorSelectionManager {
  constructor(options = {}) {
    this.floors = [];
    this.selectedFloor = null;
    this.hoveredFloor = null;
    this.onFloorSelect = options.onFloorSelect || (() => {});
    this.onFloorDeselect = options.onFloorDeselect || (() => {});
  }

  setFloors(floors) {
    this.floors = floors;
  }

  selectFloor(index) {
    if (this.selectedFloor === index) {
      this.deselectFloor();
      return;
    }

    if (this.selectedFloor !== null) {
      this._resetFloorAppearance(this.selectedFloor);
    }

    this.selectedFloor = index;
    this._applySelectedFloorAppearance(index);
    this._dimOtherFloors(index);

    this.onFloorSelect(index, this.floors[index].config);
  }

  deselectFloor() {
    if (this.selectedFloor === null) return;

    const prevSelected = this.selectedFloor;
    this.selectedFloor = null;

    this.floors.forEach((floor) => {
      this._resetFloorAppearance(floor.index);
    });

    this.onFloorDeselect(prevSelected);
  }

  hoverFloor(index) {
    if (this.hoveredFloor === index || this.selectedFloor === index) return;

    if (this.hoveredFloor !== null && this.hoveredFloor !== this.selectedFloor) {
      this.floors[this.hoveredFloor].slab.material.emissive.setHex(0x000000);
    }

    if (index !== null) {
      this.hoveredFloor = index;
      this.floors[index].slab.material.emissive.setHex(0x222244);
      return true;
    }

    this.hoveredFloor = null;
    return false;
  }

  unhoverFloor() {
    if (this.hoveredFloor !== null && this.hoveredFloor !== this.selectedFloor) {
      this.floors[this.hoveredFloor].slab.material.emissive.setHex(0x000000);
    }
    this.hoveredFloor = null;
  }

  _applySelectedFloorAppearance(index) {
    const floor = this.floors[index];
    floor.slab.material.emissive.setHex(0x334466);
    floor.slab.material.opacity = 1.0;
    floor.meshes.forEach((m) => {
      if (m.userData.type === "wall") m.material.opacity = 0.5;
    });
  }

  _dimOtherFloors(selectedIndex) {
    this.floors.forEach((f) => {
      if (f.index !== selectedIndex) {
        f.slab.material.opacity = 0.2;
        f.meshes.forEach((m) => {
          if (m.userData.type === "wall") m.material.opacity = 0.05;
        });
        f.furnitureGroup.visible = false;
        f.label.material.opacity = 0.3;
      } else {
        f.label.material.opacity = 1;
      }
    });
  }

  _resetFloorAppearance(index) {
    const floor = this.floors[index];
    floor.slab.material.emissive.setHex(0x000000);
    floor.slab.material.opacity = 0.85;
    floor.meshes.forEach((m) => {
      if (m.userData.type === "wall") m.material.opacity = 0.25;
    });
    floor.label.material.opacity = 1;
  }

  resetAllFloors(showFurniture) {
    this.selectedFloor = null;
    this.hoveredFloor = null;
    this.floors.forEach((f) => {
      f.slab.material.emissive.setHex(0x000000);
      f.slab.material.opacity = 0.85;
      f.meshes.forEach((m) => {
        if (m.userData.type === "wall") m.material.opacity = 0.25;
      });
      f.furnitureGroup.visible = showFurniture;
      f.label.material.opacity = 1;
    });
  }

  getSelectedFloor() {
    return this.selectedFloor;
  }

  isFloorSelected(index) {
    return this.selectedFloor === index;
  }
}
