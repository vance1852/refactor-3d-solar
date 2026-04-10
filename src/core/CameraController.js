/**
 * 轨道相机控制模块
 * 手动实现轨道相机控制（不使用 OrbitControls）
 */

import * as THREE from "three";

/**
 * 默认相机配置
 */
export const DEFAULT_CAMERA_CONFIG = {
  radius: 50,
  theta: Math.PI / 4,
  phi: Math.PI / 3,
  target: new THREE.Vector3(0, 8, 0),
  minRadius: 15,
  maxRadius: 120,
  minPhi: 0.2,
  maxPhi: Math.PI - 0.2,
};

export class CameraController {
  constructor(camera, options = {}) {
    this.camera = camera;
    this.config = { ...DEFAULT_CAMERA_CONFIG, ...options };

    this.radius = this.config.radius;
    this.theta = this.config.theta;
    this.phi = this.config.phi;
    this.target = this.config.target.clone();

    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.sensitivity = options.sensitivity ?? 0.005;
    this.zoomSensitivity = options.zoomSensitivity ?? 0.05;
  }

  /**
   * 更新相机位置
   */
  update() {
    this.camera.position.x = this.target.x + this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    this.camera.position.y = this.target.y + this.radius * Math.cos(this.phi);
    this.camera.position.z = this.target.z + this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    this.camera.lookAt(this.target);
  }

  /**
   * 处理鼠标按下
   * @param {number} x - 鼠标X坐标
   * @param {number} y - 鼠标Y坐标
   * @param {number} button - 鼠标按钮 (0=左键)
   */
  onMouseDown(x, y, button = 0) {
    if (button === 0) {
      this.isDragging = true;
      this.lastMouseX = x;
      this.lastMouseY = y;
    }
  }

  /**
   * 处理鼠标移动
   * @param {number} x - 鼠标X坐标
   * @param {number} y - 鼠标Y坐标
   * @returns {boolean} 是否发生了旋转
   */
  onMouseMove(x, y) {
    if (!this.isDragging) {
      return false;
    }

    const dx = x - this.lastMouseX;
    const dy = y - this.lastMouseY;

    this.theta -= dx * this.sensitivity;
    this.phi = Math.max(this.config.minPhi, Math.min(this.config.maxPhi, this.phi + dy * this.sensitivity));

    this.lastMouseX = x;
    this.lastMouseY = y;

    return true;
  }

  /**
   * 处理鼠标释放
   */
  onMouseUp() {
    this.isDragging = false;
  }

  /**
   * 处理滚轮缩放
   * @param {number} delta - 滚轮增量
   */
  onWheel(delta) {
    this.radius = Math.max(
      this.config.minRadius,
      Math.min(this.config.maxRadius, this.radius + delta * this.zoomSensitivity)
    );
  }

  /**
   * 设置相机目标点
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setTarget(x, y, z) {
    this.target.set(x, y, z);
  }

  /**
   * 设置相机半径
   * @param {number} radius
   */
  setRadius(radius) {
    this.radius = Math.max(this.config.minRadius, Math.min(this.config.maxRadius, radius));
  }

  /**
   * 设置球坐标角度
   * @param {number} theta
   * @param {number} phi
   */
  setAngles(theta, phi) {
    this.theta = theta;
    this.phi = Math.max(this.config.minPhi, Math.min(this.config.maxPhi, phi));
  }

  /**
   * 重置到默认状态
   */
  reset() {
    this.radius = this.config.radius;
    this.theta = this.config.theta;
    this.phi = this.config.phi;
    this.target.copy(this.config.target);
    this.isDragging = false;
  }

  /**
   * 聚焦到指定楼层
   * @param {number} floorIndex - 楼层索引
   * @param {number} floorHeight - 楼层高度
   * @param {number} radius - 可选的相机半径
   */
  focusOnFloor(floorIndex, floorHeight, radius = 35) {
    this.setTarget(0, floorIndex * floorHeight + floorHeight / 2, 0);
    this.setRadius(radius);
  }

  /**
   * 获取当前状态（用于测试）
   * @returns {Object}
   */
  getState() {
    return {
      radius: this.radius,
      theta: this.theta,
      phi: this.phi,
      target: this.target.clone(),
      isDragging: this.isDragging,
    };
  }
}
