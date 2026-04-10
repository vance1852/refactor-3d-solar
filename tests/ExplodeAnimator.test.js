/**
 * ExplodeAnimator 单元测试
 * 验证爆炸视图位置计算逻辑
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  ExplodeAnimator,
  ANIMATION_STATE,
} from "../src/modules/ExplodeAnimator.js";

describe("ExplodeAnimator", () => {
  describe("构造函数和初始状态", () => {
    it("应该使用默认配置初始化", () => {
      const animator = new ExplodeAnimator();
      expect(animator.progress).toBe(0);
      expect(animator.state).toBe(ANIMATION_STATE.IDLE);
      expect(animator.direction).toBe(0);
    });

    it("应该接受自定义配置", () => {
      const animator = new ExplodeAnimator({
        floorHeight: 4,
        explodeSpacing: 5,
        animationSpeed: 3,
      });
      expect(animator.floorHeight).toBe(4);
      expect(animator.explodeSpacing).toBe(5);
      expect(animator.animationSpeed).toBe(3);
    });
  });

  describe("状态控制 - 正常场景", () => {
    let animator;

    beforeEach(() => {
      animator = new ExplodeAnimator();
    });

    it("expand 应该设置正确的状态和方向", () => {
      animator.expand();
      expect(animator.state).toBe(ANIMATION_STATE.EXPANDING);
      expect(animator.direction).toBe(1);
    });

    it("collapse 应该设置正确的状态和方向", () => {
      animator.collapse();
      expect(animator.state).toBe(ANIMATION_STATE.COLLAPSING);
      expect(animator.direction).toBe(-1);
    });

    it("toggle 应该从收缩状态切换到展开", () => {
      const result = animator.toggle();
      expect(result).toBe(true);
      expect(animator.isExpanding()).toBe(true);
    });

    it("toggle 应该从展开状态切换到收缩", () => {
      animator.setProgress(1);
      const result = animator.toggle();
      expect(result).toBe(false);
      expect(animator.isCollapsing()).toBe(true);
    });
  });

  describe("update - 正常场景", () => {
    let animator;

    beforeEach(() => {
      animator = new ExplodeAnimator({ animationSpeed: 2 });
    });

    it("应该在展开时增加进度", () => {
      animator.expand();
      const isAnimating = animator.update(0.1);
      expect(animator.progress).toBeGreaterThan(0);
      expect(isAnimating || animator.progress === 1).toBe(true);
    });

    it("应该在收缩时减少进度", () => {
      animator.setProgress(1);
      animator.collapse();
      const isAnimating = animator.update(0.1);
      expect(animator.progress).toBeLessThan(1);
      expect(isAnimating || animator.progress === 0).toBe(true);
    });

    it("应该在进度达到 1 时停止动画", () => {
      animator.expand();
      animator.update(10);
      expect(animator.progress).toBe(1);
      expect(animator.state).toBe(ANIMATION_STATE.IDLE);
    });

    it("应该在进度达到 0 时停止动画", () => {
      animator.setProgress(0.5);
      animator.collapse();
      animator.update(10);
      expect(animator.progress).toBe(0);
      expect(animator.state).toBe(ANIMATION_STATE.IDLE);
    });
  });

  describe("update - 边界场景", () => {
    let animator;

    beforeEach(() => {
      animator = new ExplodeAnimator({ animationSpeed: 2 });
    });

    it("应该在 delta 为 0 时保持进度不变", () => {
      animator.setProgress(0.5);
      animator.expand();
      animator.update(0);
      expect(animator.progress).toBe(0.5);
    });

    it("应该在 IDLE 状态下不更新进度", () => {
      animator.setProgress(0.5);
      animator.update(1);
      expect(animator.progress).toBe(0.5);
    });

    it("应该处理负的 delta 值", () => {
      animator.expand();
      animator.update(-0.1);
      expect(animator.progress).toBe(0);
    });

    it("应该处理极大的 delta 值", () => {
      animator.expand();
      animator.update(1000);
      expect(animator.progress).toBe(1);
      expect(animator.state).toBe(ANIMATION_STATE.IDLE);
    });
  });

  describe("位置计算 - 正常场景", () => {
    let animator;

    beforeEach(() => {
      animator = new ExplodeAnimator({
        floorHeight: 3.5,
        explodeSpacing: 3,
      });
    });

    it("应该在进度为 0 时返回基础 Y 坐标", () => {
      animator.setProgress(0);
      const y = animator.calculateSlabY(0, 0);
      expect(y).toBe(0);
    });

    it("应该在进度为 1 时返回正确的展开位置", () => {
      animator.setProgress(1);
      const floorIndex = 2;
      const yBase = 7;
      const y = animator.calculateSlabY(floorIndex, yBase);
      expect(y).toBe(7 + 2 * 3);
    });

    it("应该正确计算墙体 Y 坐标", () => {
      animator.setProgress(0.5);
      const y = animator.calculateWallY(1, 3.5);
      expect(y).toBe(3.5 + 1 * 3 * 0.5 + 3.5 / 2);
    });

    it("应该正确计算家具偏移", () => {
      animator.setProgress(0.5);
      const offset = animator.calculateFurnitureOffsetY(2);
      expect(offset).toBe(2 * 3 * 0.5);
    });
  });

  describe("位置计算 - 边界场景", () => {
    let animator;

    beforeEach(() => {
      animator = new ExplodeAnimator({
        floorHeight: 3.5,
        explodeSpacing: 3,
      });
    });

    it("应该处理第 0 层（地面层）", () => {
      animator.setProgress(1);
      const y = animator.calculateSlabY(0, 0);
      expect(y).toBe(0);
    });

    it("应该处理最高层（第 5 层）", () => {
      animator.setProgress(1);
      const y = animator.calculateSlabY(5, 17.5);
      expect(y).toBe(17.5 + 5 * 3);
    });

    it("应该在负进度时返回基础位置", () => {
      animator.setProgress(-0.5);
      const y = animator.calculateSlabY(2, 7);
      expect(y).toBe(7);
    });

    it("应该将大于1的进度裁剪为1", () => {
      animator.setProgress(1.5);
      // setProgress 会将值裁剪到 [0,1] 范围
      expect(animator.progress).toBe(1);
      const y = animator.calculateSlabY(2, 7);
      expect(y).toBe(7 + 2 * 3 * 1);
    });
  });

  describe("calculateAllPositions", () => {
    it("应该为所有楼层计算位置", () => {
      const animator = new ExplodeAnimator({
        floorHeight: 3.5,
        explodeSpacing: 3,
      });
      animator.setProgress(0.5);

      const floors = [
        { index: 0, yBase: 0 },
        { index: 1, yBase: 3.5 },
        { index: 2, yBase: 7 },
      ];

      const positions = animator.calculateAllPositions(floors);

      expect(positions).toHaveLength(3);
      expect(positions[0].index).toBe(0);
      expect(positions[1].index).toBe(1);
      expect(positions[2].index).toBe(2);
    });

    it("应该计算所有相关位置属性", () => {
      const animator = new ExplodeAnimator({
        floorHeight: 3.5,
        explodeSpacing: 3,
      });
      animator.setProgress(0.5);

      const floors = [{ index: 1, yBase: 3.5 }];
      const positions = animator.calculateAllPositions(floors);

      expect(positions[0]).toHaveProperty("slabY");
      expect(positions[0]).toHaveProperty("wallY");
      expect(positions[0]).toHaveProperty("furnitureOffsetY");
      expect(positions[0]).toHaveProperty("heatmapY");
      expect(positions[0]).toHaveProperty("labelY");
    });
  });

  describe("状态查询", () => {
    let animator;

    beforeEach(() => {
      animator = new ExplodeAnimator();
    });

    it("isExpanded 应该在进度为 1 时返回 true", () => {
      animator.setProgress(1);
      expect(animator.isExpanded()).toBe(true);
    });

    it("isCollapsed 应该在进度为 0 时返回 true", () => {
      animator.setProgress(0);
      expect(animator.isCollapsed()).toBe(true);
    });

    it("isAnimating 应该在非 IDLE 状态时返回 true", () => {
      animator.expand();
      expect(animator.isAnimating()).toBe(true);
    });

    it("应该在中间进度时正确报告状态", () => {
      animator.setProgress(0.5);
      expect(animator.isExpanded()).toBe(false);
      expect(animator.isCollapsed()).toBe(false);
    });
  });

  describe("reset", () => {
    it("应该重置所有状态到初始值", () => {
      const animator = new ExplodeAnimator();
      animator.setProgress(0.8);
      animator.expand();

      animator.reset();

      expect(animator.progress).toBe(0);
      expect(animator.state).toBe(ANIMATION_STATE.IDLE);
      expect(animator.direction).toBe(0);
    });
  });
});
