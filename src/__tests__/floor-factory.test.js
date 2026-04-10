import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  createFloorSlab,
  createWalls,
  createFurniture,
  furnitureStrategies,
} from "../modules/floor-factory.js";
import { BUILDING_CONSTANTS } from "../config/building-constants.js";

describe("floor factory module", () => {
  describe("createFloorSlab function", () => {
    it("should create floor slab with correct properties for normal case (floor index 2)", () => {
      const config = { color: 0x4488ff };
      const floorIndex = 2;
      const result = createFloorSlab(config, floorIndex);

      expect(result.slab).toBeInstanceOf(THREE.Mesh);
      expect(result.slab.userData.floorIndex).toBe(floorIndex);
      expect(result.slab.userData.type).toBe("slab");
      expect(result.yBase).toBe(floorIndex * BUILDING_CONSTANTS.FLOOR_HEIGHT);
    });

    it("should handle boundary case: floor index 0 (ground floor)", () => {
      const config = { color: 0xff0000 };
      const result = createFloorSlab(config, 0);

      expect(result.slab.position.y).toBe(0);
      expect(result.yBase).toBe(0);
      expect(result.slab.userData.floorIndex).toBe(0);
    });

    it("should handle boundary case: floor index at max count (top floor)", () => {
      const config = { color: 0x00ff00 };
      const topFloorIndex = BUILDING_CONSTANTS.FLOOR_COUNT - 1;
      const result = createFloorSlab(config, topFloorIndex);

      expect(result.yBase).toBe(
        topFloorIndex * BUILDING_CONSTANTS.FLOOR_HEIGHT,
      );
      expect(result.slab.userData.floorIndex).toBe(topFloorIndex);
    });

    it("should have correct shadow properties enabled", () => {
      const config = { color: 0xffffff };
      const result = createFloorSlab(config, 1);

      expect(result.slab.castShadow).toBe(true);
      expect(result.slab.receiveShadow).toBe(true);
    });
  });

  describe("createWalls function", () => {
    it("should create 4 walls for a floor", () => {
      const walls = createWalls(0, 1);
      expect(walls).toHaveLength(4);
      walls.forEach((wall) => {
        expect(wall).toBeInstanceOf(THREE.Mesh);
      });
    });

    it("should position walls correctly at given yBase", () => {
      const yBase = 10;
      const walls = createWalls(yBase, 2);
      walls.forEach((wall) => {
        expect(wall.userData.floorIndex).toBe(2);
        expect(wall.userData.type).toBe("wall");
      });
    });

    it("should handle boundary case: negative floor index", () => {
      const walls = createWalls(0, -1);
      expect(walls).toHaveLength(4);
      walls.forEach((wall) => {
        expect(wall.userData.floorIndex).toBe(-1);
      });
    });

    it("should handle boundary case: very large y coordinate", () => {
      const walls = createWalls(1000, 100);
      expect(walls).toHaveLength(4);
    });
  });

  describe("createFurniture function", () => {
    it("should create lobby furniture using strategy pattern", () => {
      const config = { furnitureType: "lobby" };
      const furniture = createFurniture(config, 0, 0);
      expect(furniture).toBeInstanceOf(THREE.Group);
      expect(furniture.children.length).toBeGreaterThan(0);
    });

    it("should create office furniture", () => {
      const config = { furnitureType: "office" };
      const furniture = createFurniture(config, 1, 3.5);
      expect(furniture).toBeInstanceOf(THREE.Group);
      expect(furniture.userData.floorIndex).toBe(1);
    });

    it("should create meeting furniture with rooms config", () => {
      const config = {
        furnitureType: "meeting",
        rooms: [{ x: 0, z: 0, w: 5, d: 3 }],
      };
      const furniture = createFurniture(config, 2, 7);
      expect(furniture).toBeInstanceOf(THREE.Group);
      expect(furniture.children.length).toBeGreaterThan(0);
    });

    it("should create server furniture", () => {
      const config = { furnitureType: "server" };
      const furniture = createFurniture(config, 3, 10.5);
      expect(furniture).toBeInstanceOf(THREE.Group);
      expect(furniture.children.length).toBeGreaterThan(0);
    });

    it("should create garden furniture", () => {
      const config = { furnitureType: "garden" };
      const furniture = createFurniture(config, 4, 14);
      expect(furniture).toBeInstanceOf(THREE.Group);
      expect(furniture.children.length).toBeGreaterThan(0);
    });

    it("should handle boundary case: unknown furniture type", () => {
      const config = { furnitureType: "unknown_type_xyz" };
      const furniture = createFurniture(config, 0, 0);
      expect(furniture).toBeInstanceOf(THREE.Group);
      expect(furniture.children).toHaveLength(0);
    });

    it("should handle boundary case: empty furniture config", () => {
      const config = {};
      const furniture = createFurniture(config, 0, 0);
      expect(furniture).toBeInstanceOf(THREE.Group);
      expect(furniture.children).toHaveLength(0);
    });
  });

  describe("furnitureStrategies pattern validation", () => {
    it("should contain all required furniture strategy functions", () => {
      expect(typeof furnitureStrategies.lobby).toBe("function");
      expect(typeof furnitureStrategies.office).toBe("function");
      expect(typeof furnitureStrategies.meeting).toBe("function");
      expect(typeof furnitureStrategies.server).toBe("function");
      expect(typeof furnitureStrategies.garden).toBe("function");
    });
  });
});
