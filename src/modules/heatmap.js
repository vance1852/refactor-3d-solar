import * as THREE from "three";
import { BUILDING_CONSTANTS } from "../config/building-constants.js";

export function getHeatmapColor(intensity) {
  if (intensity > 0.7) {
    return { r: 0.9, g: 0.2, b: 0.1 };
  } else if (intensity > 0.4) {
    return { r: 0.9, g: 0.8, b: 0.1 };
  } else {
    return { r: 0.1, g: 0.8, b: 0.3 };
  }
}

export function generateHeatmapVertexColors(
  occupancy,
  widthSegments,
  depthSegments,
) {
  const colors = [];
  const totalVertices = (widthSegments + 1) * (depthSegments + 1);
  for (let v = 0; v < totalVertices; v++) {
    const px = (v % (widthSegments + 1)) / widthSegments;
    const pz = Math.floor(v / (widthSegments + 1)) / depthSegments;
    const noise =
      Math.sin(px * Math.PI * 2) * Math.cos(pz * Math.PI * 2) * 0.3 + 0.5;
    const intensity = Math.min(
      1,
      Math.max(0, occupancy * noise + Math.random() * 0.15),
    );
    const color = getHeatmapColor(intensity);
    colors.push(color.r, color.g, color.b);
  }
  return colors;
}

export function createHeatmap(config, index, yBase) {
  const { BUILDING_WIDTH, BUILDING_DEPTH } = BUILDING_CONSTANTS;
  const heatmapGeo = new THREE.PlaneGeometry(
    BUILDING_WIDTH - 0.5,
    BUILDING_DEPTH - 0.5,
    20,
    14,
  );
  const heatmapMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    vertexColors: true,
  });
  const colors = generateHeatmapVertexColors(config.occupancy, 20, 14);
  heatmapGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const heatmap = new THREE.Mesh(heatmapGeo, heatmapMat);
  heatmap.rotation.x = -Math.PI / 2;
  heatmap.position.set(0, yBase + 0.2, 0);
  heatmap.visible = false;
  heatmap.userData = { floorIndex: index, type: "heatmap" };
  return heatmap;
}
