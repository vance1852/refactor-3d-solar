/**
 * 爆炸视图动画模块
 * 楼层分离动画计算
 */

import { BUILDING_CONFIG } from "../config/floorConfigs.js";

/**
 * 动画状态
 */
export const ANIMATION_STATE = {
  IDLE: "idle",
  EXPANDING: "expanding",
  COLLAPSING: "collapsing",
};

export class ExplodeAnimator {
  constructor(options = {}) {
    this.floorHeight = options.floorHeight ?? BUILDING_CONFIG.floorHeight;
    this.explodeSpacing = options.explodeSpacing ?? 3;
    this.animationSpeed = options.animationSpeed ?? 2;
    this.progress = 0;
    this.state = ANIMATION_STATE.IDLE;
    this.direction = 0;
  }

  /**
   * 开始展开动画
   */
  expand() {
    this.state = ANIMATION_STATE.EXPANDING;
    this.direction = 1;
  }

  /**
   * 开始收缩动画
   */
  collapse() {
    this.state = ANIMATION_STATE.COLLAPSING;
    this.direction = -1;
  }

  /**
   * 切换展开/收缩状态
   * @returns {boolean} 新的展开状态
   */
  toggle() {
    if (this.isExpanded() || this.isExpanding()) {
      this.collapse();
      return false;
    } else {
      this.expand();
      return true;
    }
  }

  /**
   * 更新动画进度
   * @param {number} delta - 时间增量（秒）
   * @returns {boolean} 动画是否仍在进行
   */
  update(delta) {
    if (this.state === ANIMATION_STATE.IDLE) {
      return false;
    }

    this.progress += this.direction * delta * this.animationSpeed;

    if (this.progress >= 1) {
      this.progress = 1;
      this.state = ANIMATION_STATE.IDLE;
      return false;
    }

    if (this.progress <= 0) {
      this.progress = 0;
      this.state = ANIMATION_STATE.IDLE;
      return false;
    }

    return true;
  }

  /**
   * 计算指定楼层的Y坐标
   * @param {number} floorIndex - 楼层索引
   * @param {number} yBase - 基础Y坐标
   * @returns {number} 当前Y坐标
   */
  calculateFloorY(floorIndex, yBase) {
    return yBase + floorIndex * this.explodeSpacing * this.progress;
  }

  /**
   * 计算楼板的Y坐标
   * @param {number} floorIndex - 楼层索引
   * @param {number} yBase - 基础Y坐标
   * @returns {number} 楼板Y坐标
   */
  calculateSlabY(floorIndex, yBase) {
    return this.calculateFloorY(floorIndex, yBase);
  }

  /**
   * 计算墙体的Y坐标
   * @param {number} floorIndex - 楼层索引
   * @param {number} yBase - 基础Y坐标
   * @returns {number} 墙体中心Y坐标
   */
  calculateWallY(floorIndex, yBase) {
    return this.calculateFloorY(floorIndex, yBase) + this.floorHeight / 2;
  }

  /**
   * 计算家具的Y偏移量
   * @param {number} floorIndex - 楼层索引
   * @returns {number} Y偏移量
   */
  calculateFurnitureOffsetY(floorIndex) {
    return floorIndex * this.explodeSpacing * this.progress;
  }

  /**
   * 计算热力图的Y坐标
   * @param {number} floorIndex - 楼层索引
   * @param {number} yBase - 基础Y坐标
   * @returns {number} 热力图Y坐标
   */
  calculateHeatmapY(floorIndex, yBase) {
    return this.calculateFloorY(floorIndex, yBase) + 0.2;
  }

  /**
   * 计算标签的Y坐标
   * @param {number} floorIndex - 楼层索引
   * @param {number} yBase - 基础Y坐标
   * @returns {number} 标签Y坐标
   */
  calculateLabelY(floorIndex, yBase) {
    return this.calculateFloorY(floorIndex, yBase) + this.floorHeight / 2;
  }

  /**
   * 获取所有楼层的计算位置
   * @param {Array} floors - 楼层数据数组
   * @returns {Array<Object>} 各楼层的计算位置
   */
  calculateAllPositions(floors) {
    return floors.map((floor) => ({
      index: floor.index,
      slabY: this.calculateSlabY(floor.index, floor.yBase),
      wallY: this.calculateWallY(floor.index, floor.yBase),
      furnitureOffsetY: this.calculateFurnitureOffsetY(floor.index),
      heatmapY: this.calculateHeatmapY(floor.index, floor.yBase),
      labelY: this.calculateLabelY(floor.index, floor.yBase),
    }));
  }

  /**
   * 检查是否完全展开
   * @returns {boolean}
   */
  isExpanded() {
    return this.progress >= 1;
  }

  /**
   * 检查是否完全收缩
   * @returns {boolean}
   */
  isCollapsed() {
    return this.progress <= 0;
  }

  /**
   * 检查是否正在展开
   * @returns {boolean}
   */
  isExpanding() {
    return this.state === ANIMATION_STATE.EXPANDING;
  }

  /**
   * 检查是否正在收缩
   * @returns {boolean}
   */
  isCollapsing() {
    return this.state === ANIMATION_STATE.COLLAPSING;
  }

  /**
   * 检查是否处于动画中
   * @returns {boolean}
   */
  isAnimating() {
    return this.state !== ANIMATION_STATE.IDLE;
  }

  /**
   * 重置到初始状态
   */
  reset() {
    this.progress = 0;
    this.state = ANIMATION_STATE.IDLE;
    this.direction = 0;
  }

  /**
   * 直接设置进度（用于测试或跳转）
   * @param {number} value - 进度值 (0-1)
   */
  setProgress(value) {
    this.progress = Math.min(1, Math.max(0, value));
  }
}
