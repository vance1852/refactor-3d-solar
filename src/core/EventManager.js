/**
 * 事件管理模块
 * 处理用户交互事件
 */

import * as THREE from "three";

export class EventManager {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.camera = options.camera;
    this.floors = options.floors;
    this.cameraController = options.cameraController;
    this.floorStateManager = options.floorStateManager;
    this.explodeAnimator = options.explodeAnimator;
    this.onFloorSelect = options.onFloorSelect;
    this.onExplodeToggle = options.onExplodeToggle;
    this.onFurnitureToggle = options.onFurnitureToggle;
    this.onHeatmapToggle = options.onHeatmapToggle;
    this.onReset = options.onReset;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clickStartX = 0;
    this.clickStartY = 0;

    this.isInitialized = false;
  }

  /**
   * 初始化事件监听
   */
  init() {
    if (this.isInitialized || !this.canvas) return;

    this.setupResizeEvent();
    this.setupMouseEvents();
    this.setupUIEvents();

    this.isInitialized = true;
  }

  /**
   * 设置窗口大小变化事件
   * @private
   */
  setupResizeEvent() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  /**
   * 设置鼠标事件
   * @private
   */
  setupMouseEvents() {
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.onMouseUp());
    this.canvas.addEventListener("wheel", (e) => this.onWheel(e));
    this.canvas.addEventListener("click", (e) => this.onClick(e));
  }

  /**
   * 设置UI按钮事件
   * @private
   */
  setupUIEvents() {
    const btnExplode = document.getElementById("btn-explode");
    const btnFurniture = document.getElementById("btn-furniture");
    const btnHeatmap = document.getElementById("btn-heatmap");
    const btnReset = document.getElementById("btn-reset");

    if (btnExplode) {
      btnExplode.addEventListener("click", () => {
        const isExploded = this.explodeAnimator.toggle();
        btnExplode.classList.toggle("active", isExploded);
        this.onExplodeToggle?.(isExploded);
      });
    }

    if (btnFurniture) {
      btnFurniture.addEventListener("click", () => {
        const showFurniture = this.floorStateManager.toggleFurniture();
        btnFurniture.classList.toggle("active", showFurniture);
        this.onFurnitureToggle?.(showFurniture);
      });
    }

    if (btnHeatmap) {
      btnHeatmap.addEventListener("click", () => {
        const showHeatmap = this.floorStateManager.toggleHeatmap();
        btnHeatmap.classList.toggle("active", showHeatmap);
        this.onHeatmapToggle?.(showHeatmap);
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        this.onReset?.();
      });
    }
  }

  /**
   * 处理鼠标按下
   * @private
   */
  onMouseDown(e) {
    if (e.button === 0) {
      this.clickStartX = e.clientX;
      this.clickStartY = e.clientY;
      this.cameraController.onMouseDown(e.clientX, e.clientY, e.button);
    }
  }

  /**
   * 处理鼠标移动
   * @private
   */
  onMouseMove(e) {
    this.cameraController.onMouseMove(e.clientX, e.clientY);
    this.updateHover(e);
  }

  /**
   * 处理鼠标释放
   * @private
   */
  onMouseUp() {
    this.cameraController.onMouseUp();
  }

  /**
   * 处理滚轮
   * @private
   */
  onWheel(e) {
    e.preventDefault();
    this.cameraController.onWheel(e.deltaY);
  }

  /**
   * 处理点击
   * @private
   */
  onClick(e) {
    const dx = Math.abs(e.clientX - this.clickStartX);
    const dy = Math.abs(e.clientY - this.clickStartY);

    if (dx > 5 || dy > 5) return;

    this.updateMousePosition(e);
    const floorIndex = this.raycastFloor();

    if (floorIndex !== null) {
      const selected = this.floorStateManager.select(floorIndex);
      this.onFloorSelect?.(floorIndex, selected);
    } else {
      this.floorStateManager.deselect();
      this.onFloorSelect?.(null, false);
    }
  }

  /**
   * 更新悬停状态
   * @private
   */
  updateHover(e) {
    this.updateMousePosition(e);
    const floorIndex = this.raycastFloor();

    this.floorStateManager.setHovered(floorIndex);
    this.canvas.style.cursor = floorIndex !== null ? "pointer" : "default";
  }

  /**
   * 更新鼠标位置
   * @private
   */
  updateMousePosition(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  /**
   * 射线检测楼层
   * @private
   * @returns {number|null}
   */
  raycastFloor() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const slabs = this.floors.map((f) => f.slab);
    const intersects = this.raycaster.intersectObjects(slabs);

    if (intersects.length > 0) {
      return intersects[0].object.userData.floorIndex;
    }
    return null;
  }

  /**
   * 更新UI按钮状态
   * @param {Object} states
   */
  updateButtonStates(states) {
    const btnExplode = document.getElementById("btn-explode");
    const btnFurniture = document.getElementById("btn-furniture");
    const btnHeatmap = document.getElementById("btn-heatmap");

    if (btnExplode && states.isExploded !== undefined) {
      btnExplode.classList.toggle("active", states.isExploded);
    }
    if (btnFurniture && states.showFurniture !== undefined) {
      btnFurniture.classList.toggle("active", states.showFurniture);
    }
    if (btnHeatmap && states.showHeatmap !== undefined) {
      btnHeatmap.classList.toggle("active", states.showHeatmap);
    }
  }

  /**
   * 更新信息面板
   * @param {string} html
   */
  updateInfoPanel(html) {
    const panel = document.getElementById("info-panel");
    if (panel) {
      panel.innerHTML = html;
    }
  }

  /**
   * 销毁事件监听
   */
  dispose() {
  }
}
