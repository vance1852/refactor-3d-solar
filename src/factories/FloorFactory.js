/**
 * 楼层工厂模块
 * 数据驱动的楼层生成，消除 if-else 分支和重复代码
 */

import * as THREE from "three";
import { MATERIAL_CONFIG, BUILDING_CONFIG } from "../config/floorConfigs.js";
import {
  LobbyFurniture,
  OfficeFurniture,
  MeetingFurniture,
  ServerFurniture,
  GardenFurniture,
} from "../furniture/index.js";

/**
 * 家具生成器注册表
 */
const FURNITURE_REGISTRY = {
  lobby: LobbyFurniture,
  office: OfficeFurniture,
  meeting: MeetingFurniture,
  server: ServerFurniture,
  garden: GardenFurniture,
};

export class FloorFactory {
  constructor(buildingGroup) {
    this.buildingGroup = buildingGroup;
    this.floorHeight = BUILDING_CONFIG.floorHeight;
    this.buildingWidth = BUILDING_CONFIG.buildingWidth;
    this.buildingDepth = BUILDING_CONFIG.buildingDepth;
  }

  /**
   * 创建单个楼层
   * @param {number} index - 楼层索引
   * @param {Object} config - 楼层配置
   * @returns {Object} 楼层数据对象
   */
  createFloor(index, config) {
    const yBase = index * this.floorHeight;
    const floorData = {
      index,
      config,
      meshes: [],
      yBase,
    };

    floorData.slab = this.createSlab(yBase, config, index);
    floorData.walls = this.createWalls(yBase, index);
    floorData.furnitureGroup = this.createFurniture(yBase, config, index);
    floorData.heatmap = this.createHeatmap(yBase, config, index);
    floorData.label = this.createLabel(yBase, config, index);

    return floorData;
  }

  /**
   * 创建楼板
   * @private
   */
  createSlab(yBase, config, index) {
    const geometry = new THREE.BoxGeometry(this.buildingWidth, 0.3, this.buildingDepth);
    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      ...MATERIAL_CONFIG.slab,
    });
    const slab = new THREE.Mesh(geometry, material);
    slab.position.set(0, yBase, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    slab.userData = { floorIndex: index, type: "slab" };
    this.buildingGroup.add(slab);
    return slab;
  }

  /**
   * 创建墙体
   * @private
   */
  createWalls(yBase, index) {
    const walls = [];
    const wallHeight = this.floorHeight - 0.3;
    const materialConfig = { ...MATERIAL_CONFIG.wall, side: THREE.DoubleSide };
    const wallMat = new THREE.MeshStandardMaterial(materialConfig);

    const wallConfigs = [
      { width: this.buildingWidth, x: 0, z: this.buildingDepth / 2, ry: 0 },
      { width: this.buildingWidth, x: 0, z: -this.buildingDepth / 2, ry: Math.PI },
      { width: this.buildingDepth, x: -this.buildingWidth / 2, z: 0, ry: Math.PI / 2 },
      { width: this.buildingDepth, x: this.buildingWidth / 2, z: 0, ry: -Math.PI / 2 },
    ];

    wallConfigs.forEach(({ width, x, z, ry }) => {
      const geometry = new THREE.PlaneGeometry(width, wallHeight);
      const wall = new THREE.Mesh(geometry, wallMat.clone());
      wall.position.set(x, yBase + this.floorHeight / 2, z);
      wall.rotation.y = ry;
      wall.userData = { floorIndex: index, type: "wall" };
      this.buildingGroup.add(wall);
      walls.push(wall);
    });

    return walls;
  }

  /**
   * 创建家具
   * @private
   */
  createFurniture(yBase, config, index) {
    const furnitureGroup = new THREE.Group();
    furnitureGroup.userData = { floorIndex: index, type: "furniture" };

    const FurnitureClass = FURNITURE_REGISTRY[config.furnitureType];
    if (FurnitureClass) {
      const furniture = new FurnitureClass();
      furniture.create(yBase, config);
      furnitureGroup.add(furniture.group);
    }

    this.buildingGroup.add(furnitureGroup);
    return furnitureGroup;
  }

  /**
   * 创建热力图
   * @private
   */
  createHeatmap(yBase, config, index) {
    const geometry = new THREE.PlaneGeometry(
      this.buildingWidth - 0.5,
      this.buildingDepth - 0.5,
      20,
      14
    );
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      vertexColors: true,
    });

    const heatColors = this.generateHeatmapColors(geometry, config.occupancy);
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(heatColors, 3));

    const heatmap = new THREE.Mesh(geometry, material);
    heatmap.rotation.x = -Math.PI / 2;
    heatmap.position.set(0, yBase + 0.2, 0);
    heatmap.visible = false;
    heatmap.userData = { floorIndex: index, type: "heatmap" };
    this.buildingGroup.add(heatmap);
    return heatmap;
  }

  /**
   * 生成热力图颜色
   * @private
   */
  generateHeatmapColors(geometry, occupancy) {
    const colors = [];
    const posAttr = geometry.getAttribute("position");

    for (let v = 0; v < posAttr.count; v++) {
      const px = posAttr.getX(v);
      const pz = posAttr.getY(v);
      const noise = Math.sin(px * 0.5) * Math.cos(pz * 0.5) * 0.3 + 0.5;
      const intensity = Math.min(1, Math.max(0, occupancy * noise + Math.random() * 0.15));

      if (intensity > 0.7) {
        colors.push(0.9, 0.2, 0.1);
      } else if (intensity > 0.4) {
        colors.push(0.9, 0.8, 0.1);
      } else {
        colors.push(0.1, 0.8, 0.3);
      }
    }

    return colors;
  }

  /**
   * 创建楼层标签
   * @private
   */
  createLabel(yBase, config, index) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, 512, 64);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`F${index + 1}: ${config.name}`, 256, 42);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const label = new THREE.Sprite(material);
    label.scale.set(10, 1.25, 1);
    label.position.set(this.buildingWidth / 2 + 6, yBase + this.floorHeight / 2, 0);
    this.buildingGroup.add(label);
    return label;
  }

  /**
   * 获取家具生成器注册表（用于测试）
   * @returns {Object}
   */
  static getFurnitureRegistry() {
    return { ...FURNITURE_REGISTRY };
  }

  /**
   * 注册自定义家具生成器（扩展用）
   * @param {string} type - 家具类型标识
   * @param {Class} FurnitureClass - 家具类
   */
  static registerFurniture(type, FurnitureClass) {
    FURNITURE_REGISTRY[type] = FurnitureClass;
  }
}
