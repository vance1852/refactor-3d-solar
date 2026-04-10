/**
 * 场景管理模块
 * 管理 Three.js 场景、渲染器、灯光和地面
 */

import * as THREE from "three";

/**
 * 默认场景配置
 */
export const DEFAULT_SCENE_CONFIG = {
  backgroundColor: 0x1a1a2e,
  groundColor: 0x2a2a3e,
  gridColor1: 0x333355,
  gridColor2: 0x222244,
  ambientLight: { color: 0x404060, intensity: 1.2 },
  directionalLight: {
    color: 0xffffff,
    intensity: 1.5,
    position: { x: 30, y: 50, z: 20 },
    shadowMapSize: 2048,
  },
  fillLight: { color: 0x8888ff, intensity: 0.4, position: { x: -20, y: 30, z: -10 } },
};

export class SceneManager {
  constructor(config = {}) {
    this.config = { ...DEFAULT_SCENE_CONFIG, ...config };
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.buildingGroup = null;
    this.clock = new THREE.Clock();
  }

  /**
   * 初始化场景
   * @returns {Object} { scene, camera, renderer, buildingGroup }
   */
  init() {
    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.buildingGroup = this.createBuildingGroup();

    this.setupLights();
    this.setupGround();
    this.setupGrid();

    return {
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      buildingGroup: this.buildingGroup,
      clock: this.clock,
    };
  }

  /**
   * 创建场景
   * @private
   */
  createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(this.config.backgroundColor);
    return scene;
  }

  /**
   * 创建相机
   * @private
   */
  createCamera() {
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    return camera;
  }

  /**
   * 创建渲染器
   * @private
   */
  createRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    return renderer;
  }

  /**
   * 创建建筑组
   * @private
   */
  createBuildingGroup() {
    const group = new THREE.Group();
    this.scene.add(group);
    return group;
  }

  /**
   * 设置灯光
   * @private
   */
  setupLights() {
    const ambient = new THREE.AmbientLight(
      this.config.ambientLight.color,
      this.config.ambientLight.intensity
    );
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(
      this.config.directionalLight.color,
      this.config.directionalLight.intensity
    );
    const { x, y, z } = this.config.directionalLight.position;
    dirLight.position.set(x, y, z);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = this.config.directionalLight.shadowMapSize;
    dirLight.shadow.mapSize.height = this.config.directionalLight.shadowMapSize;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(
      this.config.fillLight.color,
      this.config.fillLight.intensity
    );
    const fp = this.config.fillLight.position;
    fillLight.position.set(fp.x, fp.y, fp.z);
    this.scene.add(fillLight);
  }

  /**
   * 设置地面
   * @private
   */
  setupGround() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshStandardMaterial({
      color: this.config.groundColor,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  /**
   * 设置网格辅助线
   * @private
   */
  setupGrid() {
    const grid = new THREE.GridHelper(
      100,
      50,
      this.config.gridColor1,
      this.config.gridColor2
    );
    grid.position.y = 0;
    this.scene.add(grid);
  }

  /**
   * 处理窗口大小变化
   */
  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * 渲染场景
   */
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * 获取渲染器 DOM 元素
   * @returns {HTMLCanvasElement|null}
   */
  getCanvas() {
    return this.renderer?.domElement ?? null;
  }

  /**
   * 获取时钟增量时间
   * @returns {number}
   */
  getDelta() {
    return this.clock.getDelta();
  }

  /**
   * 销毁场景
   */
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }
}
