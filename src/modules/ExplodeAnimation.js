import { BUILDING_CONSTANTS } from "../config/BuildingConfig.js";

export function calculateExplodeOffset(floorIndex, progress, spacing = BUILDING_CONSTANTS.EXPLODE_SPACING) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return floorIndex * spacing * clampedProgress;
}

export function calculateFloorY(yBase, floorIndex, progress, spacing = BUILDING_CONSTANTS.EXPLODE_SPACING) {
  const offset = calculateExplodeOffset(floorIndex, progress, spacing);
  return yBase + offset;
}

export function calculateSlabPosition(yBase, floorIndex, progress) {
  return {
    x: 0,
    y: calculateFloorY(yBase, floorIndex, progress),
    z: 0,
  };
}

export function calculateWallPosition(
  baseY,
  floorIndex,
  progress,
  floorHeight = BUILDING_CONSTANTS.FLOOR_HEIGHT,
) {
  const offset = calculateExplodeOffset(floorIndex, progress);
  return baseY + offset + floorHeight / 2;
}

export function calculateHeatmapPosition(
  baseY,
  floorIndex,
  progress,
  heatmapHeightOffset = 0.2,
) {
  return {
    x: 0,
    y: calculateFloorY(baseY, floorIndex, progress) + heatmapHeightOffset,
    z: 0,
  };
}

export function calculateLabelPosition(
  baseY,
  floorIndex,
  progress,
  buildingWidth = BUILDING_CONSTANTS.BUILDING_WIDTH,
  floorHeight = BUILDING_CONSTANTS.FLOOR_HEIGHT,
) {
  const offset = calculateExplodeOffset(floorIndex, progress);
  return {
    x: buildingWidth / 2 + 6,
    y: baseY + offset + floorHeight / 2,
    z: 0,
  };
}

export function updateExplodeAnimationState(
  progress,
  direction,
  delta,
  speed = 2,
) {
  let newProgress = progress + direction * delta * speed;
  let animating = true;

  if (newProgress >= 1) {
    newProgress = 1;
    animating = false;
  }
  if (newProgress <= 0) {
    newProgress = 0;
    animating = false;
  }

  return {
    progress: newProgress,
    animating,
  };
}
