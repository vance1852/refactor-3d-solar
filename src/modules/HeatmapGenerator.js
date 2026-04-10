/**
 * 热力图生成模块
 * 独立的占用率热力图计算逻辑
 */

import * as THREE from "three";

/**
 * 热力图颜色映射配置
 */
export const HEATMAP_COLORS = {
  HIGH: { r: 0.9, g: 0.2, b: 0.1, threshold: 0.7 },
  MEDIUM: { r: 0.9, g: 0.8, b: 0.1, threshold: 0.4 },
  LOW: { r: 0.1, g: 0.8, b: 0.3, threshold: 0 },
};

export class HeatmapGenerator {
  /**
   * 根据占用率计算颜色
   * @param {number} intensity - 占用率强度 (0-1)
   * @returns {Object} RGB颜色对象 {r, g, b}
   */
  static calculateColor(intensity) {
    const normalizedIntensity = Math.min(1, Math.max(0, intensity));

    if (normalizedIntensity > HEATMAP_COLORS.HIGH.threshold) {
      return { r: HEATMAP_COLORS.HIGH.r, g: HEATMAP_COLORS.HIGH.g, b: HEATMAP_COLORS.HIGH.b };
    } else if (normalizedIntensity > HEATMAP_COLORS.MEDIUM.threshold) {
      return { r: HEATMAP_COLORS.MEDIUM.r, g: HEATMAP_COLORS.MEDIUM.g, b: HEATMAP_COLORS.MEDIUM.b };
    } else {
      return { r: HEATMAP_COLORS.LOW.r, g: HEATMAP_COLORS.LOW.g, b: HEATMAP_COLORS.LOW.b };
    }
  }

  /**
   * 计算带噪声的占用率强度
   * @param {number} baseOccupancy - 基础占用率
   * @param {number} x - X坐标
   * @param {number} z - Z坐标
   * @param {number} randomFactor - 随机因子 (0-1)
   * @returns {number} 最终强度 (0-1)
   */
  static calculateIntensity(baseOccupancy, x, z, randomFactor = 0) {
    const noise = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.3 + 0.5;
    const intensity = baseOccupancy * noise + randomFactor * 0.15;
    return Math.min(1, Math.max(0, intensity));
  }

  /**
   * 生成热力图颜色数组
   * @param {number} width - 平面宽度
   * @param {number} depth - 平面深度
   * @param {number} widthSegments - 宽度分段数
   * @param {number} depthSegments - 深度分段数
   * @param {number} occupancy - 基础占用率
   * @param {Function} randomFn - 随机数生成函数 (默认 Math.random)
   * @returns {Array<number>} 扁平化的RGB颜色数组
   */
  static generateColors(width, depth, widthSegments, depthSegments, occupancy, randomFn = Math.random) {
    const colors = [];
    const stepX = width / widthSegments;
    const stepZ = depth / depthSegments;

    for (let zIndex = 0; zIndex <= depthSegments; zIndex++) {
      for (let xIndex = 0; xIndex <= widthSegments; xIndex++) {
        const x = (xIndex - widthSegments / 2) * stepX;
        const z = (zIndex - depthSegments / 2) * stepZ;
        const intensity = this.calculateIntensity(occupancy, x, z, randomFn());
        const color = this.calculateColor(intensity);
        colors.push(color.r, color.g, color.b);
      }
    }

    return colors;
  }

  /**
   * 创建热力图网格
   * @param {number} yBase - 基础Y坐标
   * @param {number} occupancy - 占用率
   * @param {Object} buildingConfig - 建筑配置
   * @returns {THREE.Mesh}
   */
  static createHeatmapMesh(yBase, occupancy, buildingConfig) {
    const { buildingWidth, buildingDepth } = buildingConfig;
    const geometry = new THREE.PlaneGeometry(
      buildingWidth - 0.5,
      buildingDepth - 0.5,
      20,
      14
    );

    const colors = this.generateColors(
      buildingWidth - 0.5,
      buildingDepth - 0.5,
      20,
      14,
      occupancy
    );

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      vertexColors: true,
    });

    const heatmap = new THREE.Mesh(geometry, material);
    heatmap.rotation.x = -Math.PI / 2;
    heatmap.position.y = yBase + 0.2;
    heatmap.visible = false;

    return heatmap;
  }

  /**
   * 获取颜色映射配置
   * @returns {Object}
   */
  static getColorConfig() {
    return { ...HEATMAP_COLORS };
  }
}
