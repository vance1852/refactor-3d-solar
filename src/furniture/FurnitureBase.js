/**
 * 家具基类
 * 定义家具生成器的通用接口
 */

import * as THREE from "three";

export class FurnitureBase {
  constructor() {
    this.group = new THREE.Group();
  }

  /**
   * 创建家具组
   * @param {number} yBase - 楼层基础Y坐标
   * @param {Object} config - 楼层配置
   * @returns {THREE.Group}
   */
  create(yBase, config) {
    this.group = new THREE.Group();
    this.yBase = yBase;
    this.config = config;
    this.buildFurniture();
    return this.group;
  }

  /**
   * 构建家具 - 子类必须实现
   * @abstract
   */
  buildFurniture() {
    throw new Error("buildFurniture must be implemented by subclass");
  }

  /**
   * 创建盒子网格
   * @protected
   */
  createBox(width, height, depth, color, x, y, z, options = {}) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.5,
      metalness: options.metalness ?? 0,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, this.yBase + y, z);
    if (options.castShadow !== false) {
      mesh.castShadow = true;
    }
    this.group.add(mesh);
    return mesh;
  }

  /**
   * 创建圆柱体网格
   * @protected
   */
  createCylinder(topRadius, bottomRadius, height, color, x, y, z, options = {}) {
    const geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, height, options.segments ?? 8);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.5,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, this.yBase + y, z);
    this.group.add(mesh);
    return mesh;
  }

  /**
   * 创建球体网格
   * @protected
   */
  createSphere(radius, color, x, y, z, options = {}) {
    const geometry = new THREE.SphereGeometry(radius, options.segments ?? 8, options.segments ?? 8);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.5,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, this.yBase + y, z);
    if (options.castShadow !== false) {
      mesh.castShadow = true;
    }
    this.group.add(mesh);
    return mesh;
  }
}
