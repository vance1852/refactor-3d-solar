import { describe, it, expect, beforeAll } from "vitest";
import {
  createSlab,
  createWalls,
  createFurnitureGroup,
} from "../src/factories/FloorFactory.js";

beforeAll(() => {
  global.document = undefined;
  global.Image = class {};
});

const mockRooms = [
  { x: 0, z: 0, w: 3, d: 4 },
  { x: 5, z: 0, w: 3, d: 4 },
];
const mockConfig = { color: 0x4488ff, furnitureType: "office" };

describe("FloorFactory 楼层工厂模块", () => {
  describe("createSlab 楼板生成", () => {
    it("正常场景: slab生成包含正确userData", () => {
      const slab = createSlab(0, mockConfig, 0);

      expect(slab.userData.floorIndex).toBe(0);
      expect(slab.userData.type).toBe("slab");
      expect(slab.castShadow).toBe(true);
      expect(slab.receiveShadow).toBe(true);
    });

    it("边界场景1: index = 0 slab位置Y正确", () => {
      const yBase = 0;
      const slab = createSlab(yBase, mockConfig, 0);
      expect(slab.position.y).toBe(yBase);
    });

    it("边界场景2: 高层（index=10）slab位置Y为 index * 3.5", () => {
      const yBase = 35;
      const slab = createSlab(yBase, mockConfig, 10);
      expect(slab.position.y).toBe(35);
    });

    it("边界场景3: 负yBase不崩溃", () => {
      expect(() => createSlab(-100, mockConfig, 0)).not.toThrow();
    });
  });

  describe("createWalls 墙体生成", () => {
    it("正常场景: 返回4面墙数组", () => {
      const walls = createWalls(0, 1);
      expect(Array.isArray(walls)).toBe(true);
      expect(walls.length).toBe(4);
      walls.forEach((wall) => {
        expect(wall.userData.type).toBe("wall");
      });
    });

    it("边界场景1: index = 0 墙体也成功生成4面墙", () => {
      const walls = createWalls(0, 0);
      expect(walls.length).toBe(4);
    });

    it("边界场景2: 超大index不崩溃", () => {
      expect(() => createWalls(0, 10000)).not.toThrow();
    });

    it("边界场景3: 负baseY值正常工作", () => {
      expect(() => createWalls(-10, 1)).not.toThrow();
      const walls = createWalls(-10, 1);
      expect(walls.length).toBe(4);
    });
  });

  describe("createFurnitureGroup 家具组工厂生成", () => {
    it("正常场景: office家具类型成功创建Group", () => {
      const group = createFurnitureGroup("office", 0, mockRooms, 1);
      expect(group.type).toBe("Group");
      expect(group.userData.floorIndex).toBe(1);
      expect(group.children.length).toBeGreaterThan(0);
    });

    it("边界场景1: lobby家具类型正确返回子对象", () => {
      const group = createFurnitureGroup("lobby", 0, mockRooms, 0);
      expect(group.children.length).toBeGreaterThan(0);
    });

    it("边界场景2: meeting家具类型需要数组参数", () => {
      const group = createFurnitureGroup("meeting", 0, mockRooms, 2);
      expect(group.children.length).toBeGreaterThan(0);
    });

    it("边界场景3: server家具类型", () => {
      const group = createFurnitureGroup("server", 0, mockRooms, 3);
      expect(group.children.length).toBeGreaterThan(0);
    });

    it("边界场景4: garden家具类型", () => {
      const group = createFurnitureGroup("garden", 0, mockRooms, 4);
      expect(group).toBeDefined();
    });

    it("边界场景5: 无效家具类型不抛出异常", () => {
      expect(() =>
        createFurnitureGroup("invalid_furniture", 0, mockRooms, 0),
      ).not.toThrow();
      const group = createFurnitureGroup("invalid_furniture", 0, mockRooms, 0);
      expect(group.children.length).toBe(0);
    });

    it("边界场景6: rooms为空数组时不崩溃", () => {
      expect(() => createFurnitureGroup("office", 0, [], 0)).not.toThrow();
    });
  });
});
