/**
 * 楼层状态管理模块
 * 封装楼层选中/取消的状态管理逻辑
 */

/**
 * 楼层状态
 */
export const FLOOR_STATE = {
  NORMAL: "normal",
  SELECTED: "selected",
  DIMMED: "dimmed",
  HOVERED: "hovered",
};

/**
 * 材质状态配置
 */
export const MATERIAL_STATES = {
  [FLOOR_STATE.NORMAL]: {
    slabOpacity: 0.85,
    wallOpacity: 0.25,
    emissive: 0x000000,
    labelOpacity: 1,
  },
  [FLOOR_STATE.SELECTED]: {
    slabOpacity: 1.0,
    wallOpacity: 0.5,
    emissive: 0x334466,
    labelOpacity: 1,
  },
  [FLOOR_STATE.DIMMED]: {
    slabOpacity: 0.2,
    wallOpacity: 0.05,
    emissive: 0x000000,
    labelOpacity: 0.3,
  },
  [FLOOR_STATE.HOVERED]: {
    slabOpacity: 0.85,
    wallOpacity: 0.25,
    emissive: 0x222244,
    labelOpacity: 1,
  },
};

export class FloorStateManager {
  constructor(floors, options = {}) {
    this.floors = floors;
    this.selectedIndex = null;
    this.hoveredIndex = null;
    this.showFurniture = options.showFurniture ?? true;
    this.showHeatmap = options.showHeatmap ?? false;
  }

  /**
   * 选中楼层
   * @param {number} index - 楼层索引
   * @returns {boolean} 是否成功选中
   */
  select(index) {
    if (index === this.selectedIndex) {
      this.deselect();
      return false;
    }

    this.deselect();
    this.selectedIndex = index;
    this.applySelectionState();
    return true;
  }

  /**
   * 取消选中
   */
  deselect() {
    this.selectedIndex = null;
    this.applyNormalState();
  }

  /**
   * 设置悬停状态
   * @param {number|null} index - 楼层索引或null
   */
  setHovered(index) {
    if (this.hoveredIndex === index) {
      return;
    }

    const previousHover = this.hoveredIndex;
    this.hoveredIndex = index;

    if (previousHover !== null && previousHover !== this.selectedIndex) {
      this.applyFloorState(previousHover, FLOOR_STATE.NORMAL);
    }

    if (index !== null && index !== this.selectedIndex) {
      this.applyFloorState(index, FLOOR_STATE.HOVERED);
    }
  }

  /**
   * 应用选中状态
   * @private
   */
  applySelectionState() {
    this.floors.forEach((floor, index) => {
      if (index === this.selectedIndex) {
        this.applyFloorState(index, FLOOR_STATE.SELECTED);
        floor.furnitureGroup.visible = this.showFurniture;
      } else {
        this.applyFloorState(index, FLOOR_STATE.DIMMED);
        floor.furnitureGroup.visible = false;
      }
    });
  }

  /**
   * 应用正常状态
   * @private
   */
  applyNormalState() {
    this.floors.forEach((floor, index) => {
      this.applyFloorState(index, FLOOR_STATE.NORMAL);
      floor.furnitureGroup.visible = this.showFurniture;
    });
  }

  /**
   * 应用指定状态到单个楼层
   * @private
   */
  applyFloorState(index, state) {
    const floor = this.floors[index];
    if (!floor) return;

    const config = MATERIAL_STATES[state];

    floor.slab.material.opacity = config.slabOpacity;
    floor.slab.material.emissive.setHex(config.emissive);

    floor.walls.forEach((wall) => {
      wall.material.opacity = config.wallOpacity;
    });

    floor.label.material.opacity = config.labelOpacity;
  }

  /**
   * 切换家具显示
   * @returns {boolean} 新的显示状态
   */
  toggleFurniture() {
    this.showFurniture = !this.showFurniture;
    this.updateFurnitureVisibility();
    return this.showFurniture;
  }

  /**
   * 设置家具显示状态
   * @param {boolean} show
   */
  setFurnitureVisible(show) {
    this.showFurniture = show;
    this.updateFurnitureVisibility();
  }

  /**
   * 更新家具可见性
   * @private
   */
  updateFurnitureVisibility() {
    this.floors.forEach((floor, index) => {
      if (this.selectedIndex === null || index === this.selectedIndex) {
        floor.furnitureGroup.visible = this.showFurniture;
      }
    });
  }

  /**
   * 切换热力图显示
   * @returns {boolean} 新的显示状态
   */
  toggleHeatmap() {
    this.showHeatmap = !this.showHeatmap;
    this.updateHeatmapVisibility();
    return this.showHeatmap;
  }

  /**
   * 设置热力图显示状态
   * @param {boolean} show
   */
  setHeatmapVisible(show) {
    this.showHeatmap = show;
    this.updateHeatmapVisibility();
  }

  /**
   * 更新热力图可见性
   * @private
   */
  updateHeatmapVisibility() {
    this.floors.forEach((floor) => {
      floor.heatmap.visible = this.showHeatmap;
    });
  }

  /**
   * 获取选中楼层的配置
   * @returns {Object|null}
   */
  getSelectedConfig() {
    if (this.selectedIndex === null) return null;
    return this.floors[this.selectedIndex]?.config ?? null;
  }

  /**
   * 获取选中楼层索引
   * @returns {number|null}
   */
  getSelectedIndex() {
    return this.selectedIndex;
  }

  /**
   * 获取悬停楼层索引
   * @returns {number|null}
   */
  getHoveredIndex() {
    return this.hoveredIndex;
  }

  /**
   * 重置所有状态
   */
  reset() {
    this.selectedIndex = null;
    this.hoveredIndex = null;
    this.showFurniture = true;
    this.showHeatmap = false;
    this.applyNormalState();
    this.updateHeatmapVisibility();
  }

  /**
   * 获取当前状态快照（用于测试）
   * @returns {Object}
   */
  getState() {
    return {
      selectedIndex: this.selectedIndex,
      hoveredIndex: this.hoveredIndex,
      showFurniture: this.showFurniture,
      showHeatmap: this.showHeatmap,
    };
  }
}
