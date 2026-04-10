import { describe, it, expect } from "vitest";
import {
  calculateExplodeOffset,
  calculateFloorY,
  calculateWallPosition,
  calculateHeatmapPosition,
  calculateLabelPosition,
  updateExplodeAnimationState,
} from "../src/modules/ExplodeAnimation.js";

describe("ExplodeAnimation 爆炸动画位置计算", () => {
  describe("calculateExplodeOffset 爆炸偏移计算", () => {
    it("边界场景1: progress < 0 应钳位到 0，偏移量为 0", () => {
      const offset = calculateExplodeOffset(2, -0.5, 3);
      expect(offset).toBe(0);
    });

    it("边界场景2: progress > 1 应钳位到 1，偏移量为 floorIndex * spacing", () => {
      const offset = calculateExplodeOffset(2, 1.5, 3);
      expect(offset).toBe(6);
    });

    it("正常场景: progress = 0.5 应返回正确偏移量", () => {
      const offset = calculateExplodeOffset(2, 0.5, 3);
      expect(offset).toBe(3);
    });

    it("正常场景: 第0层（底层）offset始终为0，不受progress影响", () => {
      expect(calculateExplodeOffset(0, 0.5, 3)).toBe(0);
      expect(calculateExplodeOffset(0, 1, 3)).toBe(0);
    });
  });

  describe("calculateFloorY Y坐标计算", () => {
    it("边界场景1: progress = 0 爆炸未开始，Y = yBase", () => {
      const y = calculateFloorY(7, 2, 0, 3);
      expect(y).toBe(7);
    });

    it("边界场景2: progress = 1 爆炸完全展开", () => {
      const yBase = 7;
      const floorIndex = 2;
      const spacing = 3;
      const expectedY = yBase + floorIndex * spacing;
      expect(calculateFloorY(yBase, floorIndex, 1, spacing)).toBe(expectedY);
    });

    it("正常场景: progress = 0.5 中间状态Y坐标正确", () => {
      const yBase = 7;
      const floorIndex = 2;
      const progress = 0.5;
      const spacing = 3;
      const expectedY = yBase + floorIndex * spacing * progress;
      expect(calculateFloorY(yBase, floorIndex, progress, spacing)).toBe(expectedY);
    });
  });

  describe("calculateWallPosition 墙体Y坐标计算", () => {
    it("边界场景1: progress = 0 状态下墙体Y坐标包含 floorHeight/2", () => {
      const baseY = 7;
      const floorHeight = 3.5;
      const expectedY = baseY + floorHeight / 2;
      expect(calculateWallPosition(baseY, 2, 0, floorHeight)).toBeCloseTo(expectedY);
    });

    it("边界场景2: 顶层 progress = 1 时Y坐标正确累加", () => {
      const baseY = 17.5;
      const floorIndex = 5;
      const spacing = 3;
      const floorHeight = 3.5;
      const expectedY = baseY + floorIndex * spacing + floorHeight / 2;
      expect(calculateWallPosition(baseY, floorIndex, 1, floorHeight)).toBeCloseTo(expectedY);
    });

    it("正常场景: progress中间值计算正确", () => {
      expect(calculateWallPosition(7, 2, 0.5, 3.5)).toBeCloseTo(7 + 3 + 1.75);
    });
  });

  describe("calculateHeatmapPosition 热力图位置计算", () => {
    it("边界场景1: progress = 0 时包含高度偏移", () => {
      const result = calculateHeatmapPosition(7, 2, 0, 0.2);
      expect(result.y).toBeCloseTo(7.2);
    });

    it("边界场景2: progress = 1 时包含偏移和高度offset", () => {
      const result = calculateHeatmapPosition(7, 2, 1, 0.2);
      expect(result.y).toBeCloseTo(7 + 6 + 0.2);
    });

    it("正常场景: 返回对象结构正确", () => {
      const result = calculateHeatmapPosition(7, 2, 0.5);
      expect(result).toHaveProperty("x", 0);
      expect(result).toHaveProperty("y");
      expect(result).toHaveProperty("z", 0);
    });
  });

  describe("calculateLabelPosition 标签位置计算", () => {
    it("边界场景1: progress = 0", () => {
      const result = calculateLabelPosition(7, 2, 0, 20, 3.5);
      expect(result.x).toBe(16);
      expect(result.y).toBeCloseTo(7 + 1.75);
    });

    it("边界场景2: progress = 1 顶层标签", () => {
      const result = calculateLabelPosition(17.5, 5, 1);
      expect(result.y).toBeGreaterThan(17.5);
    });

    it("正常场景: x坐标恒为 buildingWidth/2 + 6", () => {
      const result = calculateLabelPosition(7, 2, 0.5);
      expect(result.x).toBe(16);
    });
  });

  describe("updateExplodeAnimationState 动画状态机", () => {
    it("边界场景1: progress到达1时animating变为false", () => {
      const result = updateExplodeAnimationState(0.99, 1, 0.1, 2);
      expect(result.progress).toBe(1);
      expect(result.animating).toBe(false);
    });

    it("边界场景2: progress到达0时animating变为false", () => {
      const result = updateExplodeAnimationState(0.01, -1, 0.1, 2);
      expect(result.progress).toBe(0);
      expect(result.animating).toBe(false);
    });

    it("正常场景: animating过程中返回animating=true", () => {
      const result = updateExplodeAnimationState(0.5, 1, 0.016, 2);
      expect(result.animating).toBe(true);
      expect(result.progress).toBeGreaterThan(0.5);
    });
  });
});
