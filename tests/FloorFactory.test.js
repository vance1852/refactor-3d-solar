/**
 * FloorFactory 单元测试
 * 验证楼层工厂根据配置正确生成楼层结构
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { FloorFactory } from "../src/factories/FloorFactory.js";
import { FLOOR_CONFIGS, BUILDING_CONFIG } from "../src/config/floorConfigs.js";
import * as THREE from "three";

// Mock document.createElement for CanvasTexture
global.document = {
  createElement: vi.fn(() => ({
    width: 0,
    height: 0,
    getContext: vi.fn(() => ({
      fillStyle: "",
      fillRect: vi.fn(),
      font: "",
      textAlign: "",
      fillText: vi.fn(),
    })),
  })),
};

describe("FloorFactory", () => {
  let factory;
  let mockBuildingGroup;

  beforeEach(() => {
    mockBuildingGroup = new THREE.Group();
    factory = new FloorFactory(mockBuildingGroup);
  });

  describe("构造函数", () => {
    it("应该正确初始化配置", () => {
      expect(factory.buildingGroup).toBe(mockBuildingGroup);
      expect(factory.floorHeight).toBe(BUILDING_CONFIG.floorHeight);
      expect(factory.buildingWidth).toBe(BUILDING_CONFIG.buildingWidth);
      expect(factory.buildingDepth).toBe(BUILDING_CONFIG.buildingDepth);
    });
  });

  describe("createFloor - 正常场景", () => {
    it("应该创建包含所有必要组件的楼层数据", () => {
      const config = FLOOR_CONFIGS[0];
      const floorData = factory.createFloor(0, config);

      expect(floorData).toHaveProperty("index", 0);
      expect(floorData).toHaveProperty("config", config);
      expect(floorData).toHaveProperty("yBase", 0);
      expect(floorData).toHaveProperty("slab");
      expect(floorData).toHaveProperty("walls");
      expect(floorData).toHaveProperty("furnitureGroup");
      expect(floorData).toHaveProperty("heatmap");
      expect(floorData).toHaveProperty("label");
    });

    it("应该正确计算楼层基础 Y 坐标", () => {
      const floor0 = factory.createFloor(0, FLOOR_CONFIGS[0]);
      const floor3 = factory.createFloor(3, FLOOR_CONFIGS[3]);

      expect(floor0.yBase).toBe(0);
      expect(floor3.yBase).toBe(3 * BUILDING_CONFIG.floorHeight);
    });

    it("应该创建正确数量的墙体 (4面)", () => {
      const floorData = factory.createFloor(0, FLOOR_CONFIGS[0]);
      expect(floorData.walls).toHaveLength(4);
    });

    it("应该为楼板设置正确的 userData", () => {
      const floorData = factory.createFloor(2, FLOOR_CONFIGS[2]);
      expect(floorData.slab.userData).toEqual({
        floorIndex: 2,
        type: "slab",
      });
    });

    it("应该为墙体设置正确的 userData", () => {
      const floorData = factory.createFloor(1, FLOOR_CONFIGS[1]);
      floorData.walls.forEach((wall) => {
        expect(wall.userData.floorIndex).toBe(1);
        expect(wall.userData.type).toBe("wall");
      });
    });
  });

  describe("createFloor - 不同家具类型", () => {
    it("应该为 lobby 类型创建大堂家具", () => {
      const config = FLOOR_CONFIGS.find((c) => c.furnitureType === "lobby");
      const floorData = factory.createFloor(0, config);

      expect(floorData.furnitureGroup.children.length).toBeGreaterThan(0);
      expect(floorData.furnitureGroup.userData.type).toBe("furniture");
    });

    it("应该为 office 类型创建办公家具", () => {
      const config = FLOOR_CONFIGS.find((c) => c.furnitureType === "office");
      const floorData = factory.createFloor(1, config);

      expect(floorData.furnitureGroup.children.length).toBeGreaterThan(0);
    });

    it("应该为 meeting 类型创建会议室家具", () => {
      const config = FLOOR_CONFIGS.find((c) => c.furnitureType === "meeting");
      const floorData = factory.createFloor(3, config);

      expect(floorData.furnitureGroup.children.length).toBeGreaterThan(0);
    });

    it("应该为 server 类型创建服务器家具", () => {
      const config = FLOOR_CONFIGS.find((c) => c.furnitureType === "server");
      const floorData = factory.createFloor(4, config);

      expect(floorData.furnitureGroup.children.length).toBeGreaterThan(0);
    });

    it("应该为 garden 类型创建花园家具", () => {
      const config = FLOOR_CONFIGS.find((c) => c.furnitureType === "garden");
      const floorData = factory.createFloor(5, config);

      expect(floorData.furnitureGroup.children.length).toBeGreaterThan(0);
    });
  });

  describe("createFloor - 边界场景", () => {
    it("应该处理第 0 层（地面层）", () => {
      const floorData = factory.createFloor(0, FLOOR_CONFIGS[0]);
      expect(floorData.index).toBe(0);
      expect(floorData.yBase).toBe(0);
      expect(floorData.slab.position.y).toBe(0);
    });

    it("应该处理最高层", () => {
      const lastIndex = FLOOR_CONFIGS.length - 1;
      const floorData = factory.createFloor(lastIndex, FLOOR_CONFIGS[lastIndex]);
      expect(floorData.index).toBe(lastIndex);
      expect(floorData.yBase).toBe(lastIndex * BUILDING_CONFIG.floorHeight);
    });

    it("应该处理未知的家具类型", () => {
      const config = { ...FLOOR_CONFIGS[0], furnitureType: "unknown" };
      const floorData = factory.createFloor(0, config);

      expect(floorData.furnitureGroup).toBeDefined();
    });

    it("应该处理空房间配置", () => {
      const config = { ...FLOOR_CONFIGS[0], rooms: [] };
      const floorData = factory.createFloor(0, config);

      expect(floorData.slab).toBeDefined();
      expect(floorData.walls).toHaveLength(4);
    });
  });

  describe("材质配置", () => {
    it("应该为楼板应用正确的透明度", () => {
      const floorData = factory.createFloor(0, FLOOR_CONFIGS[0]);
      expect(floorData.slab.material.transparent).toBe(true);
      expect(floorData.slab.material.opacity).toBe(0.85);
    });

    it("应该为墙体应用正确的透明度", () => {
      const floorData = factory.createFloor(0, FLOOR_CONFIGS[0]);
      floorData.walls.forEach((wall) => {
        expect(wall.material.transparent).toBe(true);
        expect(wall.material.opacity).toBe(0.25);
      });
    });

    it("应该为热力图设置正确的初始可见性", () => {
      const floorData = factory.createFloor(0, FLOOR_CONFIGS[0]);
      expect(floorData.heatmap.visible).toBe(false);
    });
  });

  describe("家具注册表", () => {
    it("应该返回家具注册表副本", () => {
      const registry = FloorFactory.getFurnitureRegistry();
      expect(registry).toHaveProperty("lobby");
      expect(registry).toHaveProperty("office");
      expect(registry).toHaveProperty("meeting");
      expect(registry).toHaveProperty("server");
      expect(registry).toHaveProperty("garden");
    });

    it("应该允许注册自定义家具", () => {
      class CustomFurniture {
        create() {
          return new THREE.Group();
        }
      }

      FloorFactory.registerFurniture("custom", CustomFurniture);
      const registry = FloorFactory.getFurnitureRegistry();

      expect(registry.custom).toBe(CustomFurniture);
    });
  });

  describe("热力图生成", () => {
    it("应该根据占用率生成热力图", () => {
      const highOccupancyConfig = { ...FLOOR_CONFIGS[0], occupancy: 0.9 };
      const lowOccupancyConfig = { ...FLOOR_CONFIGS[0], occupancy: 0.1 };

      const highFloor = factory.createFloor(0, highOccupancyConfig);
      const lowFloor = factory.createFloor(0, lowOccupancyConfig);

      expect(highFloor.heatmap).toBeDefined();
      expect(lowFloor.heatmap).toBeDefined();
      expect(highFloor.heatmap.geometry.attributes.color).toBeDefined();
      expect(lowFloor.heatmap.geometry.attributes.color).toBeDefined();
    });

    it("应该设置热力图 userData", () => {
      const floorData = factory.createFloor(2, FLOOR_CONFIGS[2]);
      expect(floorData.heatmap.userData).toEqual({
        floorIndex: 2,
        type: "heatmap",
      });
    });
  });

  describe("标签生成", () => {
    it("应该创建楼层标签", () => {
      const floorData = factory.createFloor(0, FLOOR_CONFIGS[0]);
      expect(floorData.label).toBeDefined();
      expect(floorData.label.type).toBe("Sprite");
    });

    it("应该将标签放置在正确位置", () => {
      const floorData = factory.createFloor(1, FLOOR_CONFIGS[1]);
      const expectedY = BUILDING_CONFIG.floorHeight + BUILDING_CONFIG.floorHeight / 2;
      const expectedX = BUILDING_CONFIG.buildingWidth / 2 + 6;

      expect(floorData.label.position.x).toBe(expectedX);
      expect(floorData.label.position.y).toBe(expectedY);
    });
  });
});
