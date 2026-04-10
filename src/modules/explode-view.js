import { BUILDING_CONSTANTS } from "../config/building-constants.js";

export function calculateExplodedPosition(floorIndex, baseY, progress) {
  const { EXPLODE_SPACING } = BUILDING_CONSTANTS;
  const offset = floorIndex * EXPLODE_SPACING * progress;
  return {
    slabY: baseY + offset,
    furnitureY: baseY + offset,
    heatmapY: baseY + offset + 0.2,
    labelY: baseY + offset + BUILDING_CONSTANTS.FLOOR_HEIGHT / 2,
    wallY: baseY + offset + BUILDING_CONSTANTS.FLOOR_HEIGHT / 2,
  };
}

export class ExplodeViewController {
  constructor() {
    this.isExploded = false;
    this.progress = 0;
    this.isAnimating = false;
    this.direction = 1;
  }

  toggle() {
    this.isAnimating = true;
    this.direction = this.isExploded ? -1 : 1;
    this.isExploded = !this.isExploded;
    return this.isExploded;
  }

  update(delta) {
    if (!this.isAnimating) return false;

    this.progress += this.direction * delta * 2;

    if (this.progress >= 1) {
      this.progress = 1;
      this.isAnimating = false;
    }
    if (this.progress <= 0) {
      this.progress = 0;
      this.isAnimating = false;
    }

    return true;
  }

  reset() {
    this.isExploded = false;
    this.isAnimating = true;
    this.direction = -1;
  }
}
