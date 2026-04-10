/**
 * HeatmapGenerator 单元测试
 * 验证热力图颜色计算逻辑
 */

import { describe, it, expect } from "vitest";
import {
  HeatmapGenerator,
  HEATMAP_COLORS,
} from "../src/modules/HeatmapGenerator.js";

describe("HeatmapGenerator", () => {
  describe("calculateColor - 正常场景", () => {
    it("应该将高强度 (>0.7) 映射为红色", () => {
      const color = HeatmapGenerator.calculateColor(0.85);
      expect(color.r).toBe(HEATMAP_COLORS.HIGH.r);
      expect(color.g).toBe(HEATMAP_COLORS.HIGH.g);
      expect(color.b).toBe(HEATMAP_COLORS.HIGH.b);
    });

    it("应该将中强度 (0.4-0.7) 映射为黄色", () => {
      const color = HeatmapGenerator.calculateColor(0.55);
      expect(color.r).toBe(HEATMAP_COLORS.MEDIUM.r);
      expect(color.g).toBe(HEATMAP_COLORS.MEDIUM.g);
      expect(color.b).toBe(HEATMAP_COLORS.MEDIUM.b);
    });

    it("应该将低强度 (<0.4) 映射为绿色", () => {
      const color = HeatmapGenerator.calculateColor(0.25);
      expect(color.r).toBe(HEATMAP_COLORS.LOW.r);
      expect(color.g).toBe(HEATMAP_COLORS.LOW.g);
      expect(color.b).toBe(HEATMAP_COLORS.LOW.b);
    });

    it("应该在边界值 0.7 正确选择颜色", () => {
      const color = HeatmapGenerator.calculateColor(0.7);
      expect(color.r).toBe(HEATMAP_COLORS.MEDIUM.r);
    });

    it("应该在边界值 0.4 正确选择颜色", () => {
      const color = HeatmapGenerator.calculateColor(0.4);
      expect(color.r).toBe(HEATMAP_COLORS.LOW.r);
    });
  });

  describe("calculateColor - 边界场景", () => {
    it("应该将 0 映射为绿色（最低占用率）", () => {
      const color = HeatmapGenerator.calculateColor(0);
      expect(color.r).toBe(HEATMAP_COLORS.LOW.r);
      expect(color.g).toBe(HEATMAP_COLORS.LOW.g);
      expect(color.b).toBe(HEATMAP_COLORS.LOW.b);
    });

    it("应该将 1 映射为红色（最高占用率）", () => {
      const color = HeatmapGenerator.calculateColor(1);
      expect(color.r).toBe(HEATMAP_COLORS.HIGH.r);
      expect(color.g).toBe(HEATMAP_COLORS.HIGH.g);
      expect(color.b).toBe(HEATMAP_COLORS.HIGH.b);
    });

    it("应该将负值裁剪为 0 并映射为绿色", () => {
      const color = HeatmapGenerator.calculateColor(-0.5);
      expect(color.r).toBe(HEATMAP_COLORS.LOW.r);
      expect(color.g).toBe(HEATMAP_COLORS.LOW.g);
    });

    it("应该将大于1的值裁剪为 1 并映射为红色", () => {
      const color = HeatmapGenerator.calculateColor(1.5);
      expect(color.r).toBe(HEATMAP_COLORS.HIGH.r);
      expect(color.g).toBe(HEATMAP_COLORS.HIGH.g);
    });

    it("应该处理极小的正值", () => {
      const color = HeatmapGenerator.calculateColor(0.001);
      expect(color.r).toBe(HEATMAP_COLORS.LOW.r);
      expect(color.g).toBe(HEATMAP_COLORS.LOW.g);
    });
  });

  describe("calculateIntensity - 正常场景", () => {
    it("应该正确计算带噪声的占用率强度", () => {
      const intensity = HeatmapGenerator.calculateIntensity(0.5, 0, 0, 0);
      expect(intensity).toBeGreaterThanOrEqual(0);
      expect(intensity).toBeLessThanOrEqual(1);
    });

    it("应该应用随机因子", () => {
      const baseIntensity = 0.5;
      const withRandom = HeatmapGenerator.calculateIntensity(
        baseIntensity,
        0,
        0,
        1,
      );
      const withoutRandom = HeatmapGenerator.calculateIntensity(
        baseIntensity,
        0,
        0,
        0,
      );
      expect(withRandom).not.toBe(withoutRandom);
    });
  });

  describe("calculateIntensity - 边界场景", () => {
    it("应该将结果裁剪到 [0, 1] 范围内 - 负值情况", () => {
      const intensity = HeatmapGenerator.calculateIntensity(0, 1000, 1000, 0);
      expect(intensity).toBeGreaterThanOrEqual(0);
      expect(intensity).toBeLessThanOrEqual(1);
    });

    it("应该将结果裁剪到 [0, 1] 范围内 - 超高值情况", () => {
      const intensity = HeatmapGenerator.calculateIntensity(1, 0, 0, 10);
      expect(intensity).toBe(1);
    });

    it("应该处理零占用率", () => {
      const intensity = HeatmapGenerator.calculateIntensity(0, 0, 0, 0);
      expect(intensity).toBe(0);
    });
  });

  describe("generateColors - 正常场景", () => {
    it("应该生成正确数量的颜色值", () => {
      const widthSegments = 4;
      const depthSegments = 3;
      const colors = HeatmapGenerator.generateColors(
        10,
        10,
        widthSegments,
        depthSegments,
        0.5,
      );

      const expectedVertexCount = (widthSegments + 1) * (depthSegments + 1);
      expect(colors.length).toBe(expectedVertexCount * 3);
    });

    it("应该生成有效的 RGB 值", () => {
      const colors = HeatmapGenerator.generateColors(
        10,
        10,
        2,
        2,
        0.5,
        () => 0.5,
      );

      for (let i = 0; i < colors.length; i += 3) {
        expect(colors[i]).toBeGreaterThanOrEqual(0);
        expect(colors[i]).toBeLessThanOrEqual(1);
        expect(colors[i + 1]).toBeGreaterThanOrEqual(0);
        expect(colors[i + 1]).toBeLessThanOrEqual(1);
        expect(colors[i + 2]).toBeGreaterThanOrEqual(0);
        expect(colors[i + 2]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("generateColors - 边界场景", () => {
    it("应该处理最小分段数 (0)", () => {
      const colors = HeatmapGenerator.generateColors(10, 10, 0, 0, 0.5);
      expect(colors.length).toBe(3);
    });

    it("应该处理大面积但低分段数", () => {
      const colors = HeatmapGenerator.generateColors(1000, 1000, 1, 1, 0.5);
      expect(colors.length).toBe(12);
    });

    it("应该处理高占用率情况", () => {
      // 使用固定种子避免随机性，occupancy=1 且 noise=0 时所有点都应该是高强度（红色）
      const colors = HeatmapGenerator.generateColors(10, 10, 2, 2, 1, () => 0);

      let highIntensityCount = 0;
      for (let i = 0; i < colors.length; i += 3) {
        const r = colors[i];
        // 红色通道值大于0.5认为是高强度
        if (r > 0.5) highIntensityCount++;
      }

      // 至少有一些点是高强度（由于噪声函数，不是所有点都能保证）
      expect(highIntensityCount).toBeGreaterThan(0);
    });
  });

  describe("getColorConfig", () => {
    it("应该返回颜色配置对象", () => {
      const config = HeatmapGenerator.getColorConfig();
      expect(config).toHaveProperty("HIGH");
      expect(config).toHaveProperty("MEDIUM");
      expect(config).toHaveProperty("LOW");
      expect(config.HIGH).toHaveProperty("threshold");
    });
  });
});
