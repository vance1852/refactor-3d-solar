export function getHeatmapColor(intensity) {
  const clampedIntensity = Math.min(1, Math.max(0, intensity));
  if (clampedIntensity > 0.7) {
    return { r: 0.9, g: 0.2, b: 0.1 };
  } else if (clampedIntensity > 0.4) {
    return { r: 0.9, g: 0.8, b: 0.1 };
  } else {
    return { r: 0.1, g: 0.8, b: 0.3 };
  }
}

export function getHeatmapColorHex(intensity) {
  const clampedIntensity = Math.min(1, Math.max(0, intensity));
  if (clampedIntensity > 0.7) {
    return 0xe6331a;
  } else if (clampedIntensity > 0.4) {
    return 0xe6cc1a;
  } else {
    return 0x1acc4d;
  }
}

export function generateHeatmapVertexColors(occupancy, positions) {
  const heatColors = [];
  for (let v = 0; v < positions.count; v++) {
    const px = positions.getX(v);
    const pz = positions.getY(v);
    const noise = Math.sin(px * 0.5) * Math.cos(pz * 0.5) * 0.3 + 0.5;
    const intensity = Math.min(
      1,
      Math.max(0, occupancy * noise + Math.random() * 0.15),
    );
    const color = getHeatmapColor(intensity);
    heatColors.push(color.r, color.g, color.b);
  }
  return heatColors;
}
