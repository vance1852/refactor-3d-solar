/**
 * 3D Building Floor Cutaway Visualization - Refactored
 *
 * 重构后的多模块架构：
 * - 职责清晰的模块划分
 * - 数据驱动的楼层工厂
 * - 独立的可测试模块
 * - 内聚的状态管理
 */

import { SceneManager } from "./core/SceneManager.js";
import { CameraController } from "./core/CameraController.js";
import { EventManager } from "./core/EventManager.js";
import { FloorFactory } from "./factories/FloorFactory.js";
import { HeatmapGenerator } from "./modules/HeatmapGenerator.js";
import { ExplodeAnimator } from "./modules/ExplodeAnimator.js";
import { FloorStateManager } from "./modules/FloorStateManager.js";
import { FLOOR_CONFIGS, BUILDING_CONFIG } from "./config/floorConfigs.js";

/**
 * 建筑查看器应用类
 */
class BuildingViewer {
  constructor() {
    this.sceneManager = null;
    this.cameraController = null;
    this.eventManager = null;
    this.floorFactory = null;
    this.explodeAnimator = null;
    this.floorStateManager = null;

    this.floors = [];
    this.isRunning = false;
  }

  /**
   * 初始化应用
   */
  init() {
    this.initScene();
    this.initCamera();
    this.initBuilding();
    this.initStateManager();
    this.initAnimator();
    this.initEvents();
    this.start();
  }

  /**
   * 初始化场景
   */
  initScene() {
    this.sceneManager = new SceneManager();
    const { scene, camera, renderer, buildingGroup, clock } = this.sceneManager.init();
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.buildingGroup = buildingGroup;
    this.clock = clock;
  }

  /**
   * 初始化相机控制器
   */
  initCamera() {
    this.cameraController = new CameraController(this.camera);
    this.cameraController.update();
  }

  /**
   * 初始化建筑
   */
  initBuilding() {
    this.floorFactory = new FloorFactory(this.buildingGroup);
    this.floors = FLOOR_CONFIGS.map((config, index) =>
      this.floorFactory.createFloor(index, config)
    );
  }

  /**
   * 初始化状态管理器
   */
  initStateManager() {
    this.floorStateManager = new FloorStateManager(this.floors, {
      showFurniture: true,
      showHeatmap: false,
    });
  }

  /**
   * 初始化动画器
   */
  initAnimator() {
    this.explodeAnimator = new ExplodeAnimator({
      floorHeight: BUILDING_CONFIG.floorHeight,
      explodeSpacing: 3,
      animationSpeed: 2,
    });
  }

  /**
   * 初始化事件管理
   */
  initEvents() {
    this.eventManager = new EventManager({
      canvas: this.sceneManager.getCanvas(),
      camera: this.camera,
      floors: this.floors,
      cameraController: this.cameraController,
      floorStateManager: this.floorStateManager,
      explodeAnimator: this.explodeAnimator,
      onFloorSelect: this.handleFloorSelect.bind(this),
      onExplodeToggle: this.handleExplodeToggle.bind(this),
      onFurnitureToggle: this.handleFurnitureToggle.bind(this),
      onHeatmapToggle: this.handleHeatmapToggle.bind(this),
      onReset: this.handleReset.bind(this),
    });
    this.eventManager.init();
  }

  /**
   * 处理楼层选择
   */
  handleFloorSelect(index, selected) {
    if (selected && index !== null) {
      const config = this.floors[index].config;
      this.eventManager.updateInfoPanel(
        `<b>F${index + 1}: ${config.name}</b><br>` +
        `占用率: ${Math.round(config.occupancy * 100)}%<br>` +
        `房间: ${config.rooms.map((r) => r.label).join(", ")}`
      );
      this.cameraController.focusOnFloor(index, BUILDING_CONFIG.floorHeight);
    } else {
      this.eventManager.updateInfoPanel("建筑楼层查看器");
      this.cameraController.reset();
    }
  }

  /**
   * 处理爆炸视图切换
   */
  handleExplodeToggle(isExploded) {
  }

  /**
   * 处理家具切换
   */
  handleFurnitureToggle(showFurniture) {
  }

  /**
   * 处理热力图切换
   */
  handleHeatmapToggle(showHeatmap) {
  }

  /**
   * 处理重置
   */
  handleReset() {
    this.floorStateManager.reset();
    this.explodeAnimator.reset();
    this.cameraController.reset();
    this.eventManager.updateInfoPanel("建筑楼层查看器");
    this.eventManager.updateButtonStates({
      isExploded: false,
      showFurniture: true,
      showHeatmap: false,
    });
  }

  /**
   * 启动渲染循环
   */
  start() {
    this.isRunning = true;
    this.animate();
  }

  /**
   * 动画循环
   */
  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    this.updateExplodeAnimation(delta);
    this.updateServerLEDs();
    this.cameraController.update();
    this.sceneManager.render();
  }

  /**
   * 更新爆炸视图动画
   */
  updateExplodeAnimation(delta) {
    const isAnimating = this.explodeAnimator.update(delta);
    if (!isAnimating && !this.explodeAnimator.isAnimating()) return;

    const positions = this.explodeAnimator.calculateAllPositions(this.floors);

    positions.forEach((pos) => {
      const floor = this.floors[pos.index];

      floor.slab.position.y = pos.slabY;

      floor.walls.forEach((wall) => {
        wall.position.y = pos.wallY;
      });

      floor.furnitureGroup.position.y = pos.furnitureOffsetY;
      floor.heatmap.position.y = pos.heatmapY;
      floor.label.position.y = pos.labelY;
    });
  }

  /**
   * 更新服务器LED闪烁效果
   */
  updateServerLEDs() {
    const serverFloor = this.floors[4];
    if (!serverFloor) return;

    serverFloor.furnitureGroup.children.forEach((child) => {
      if (child.userData.isLED && Math.random() < 0.02) {
        child.material.color.setHex(Math.random() > 0.3 ? 0x00ff00 : 0xff4444);
      }
    });
  }

  /**
   * 销毁应用
   */
  dispose() {
    this.isRunning = false;
    this.eventManager?.dispose();
    this.sceneManager?.dispose();
  }
}

// 启动应用
const app = new BuildingViewer();
app.init();

// 导出供测试使用
export { BuildingViewer };
