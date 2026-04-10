import { describe, it, expect } from "vitest";
import { getHeatmapColor, getHeatmapColorHex } from "../src/modules/HeatmapColor.js";

describe("HeatmapColor 热力图颜色计算", () => {
  describe("getHeatmapColor 颜色映射", () => {
    it("边界场景1: intensity < 0 应钳位到 0 并返回绿色（低占用）", () => {
      const result = getHeatmapColor(-0.5);
      expect(result).toEqual({ r: 0.1, g: 0.8, b: 0.3 });
    });

    it("边界场景2: intensity > 1 应钳位到 1 并返回红色（高占用）", () => {
      const result = getHeatmapColor(1.5);
      expect(result).toEqual({ r: 0.9, g: 0.2, b: 0.1 });
    });

    it("正常场景1: intensity = 0.2 绿色区间（0-0.4]", () => {
      const result = getHeatmapColor(0.2);
      expect(result).toEqual({ r: 0.1, g: 0.8, b: 0.3 });
    });

    it("正常场景2: intensity = 0.5 黄色区间 (0.4-0.7]", () => {
      const result = getHeatmapColor(0.5);
      expect(result).toEqual({ r: 0.9, g: 0.8, b: 0.1 });
    });

    it("正常场景3: intensity = 0.8 红色区间 (0.7-1.0]", () => {
      const result = getHeatmapColor(0.8);
      expect(result).toEqual({ r: 0.9, g: 0.2, b: 0.1 });
    });

    it("边界值精确测试: intensity = 0.4 应属于绿色区间", () => {
      const result = getHeatmapColor(0.4);
      expect(result).toEqual({ r: 0.1, g: 0.8, b: 0.3 });
    });

    it("边界值精确测试: intensity = 0.7 应属于黄色区间", () => {
      const result = getHeatmapColor(0.7);
      expect(result).toEqual({ r: 0.9, g: 0.8, b: 0.1 });
    });

    it("边界值精确测试: intensity = 0 应返回绿色", () => {
      const result = getHeatmapColor(0);
      expect(result).toEqual({ r: 0.1, g: 0.8, b: 0.3 });
    });

    it("边界值精确测试: intensity = 1 应返回红色", () => {
      const result = getHeatmapColor(1);
      expect(result).toEqual({ r: 0.9, g: 0.2, b: 0.1 });
    });
  });

  describe("getHeatmapColorHex 十六进制颜色映射", () => {
    it("边界场景1: 负值 -0.1 应返回绿色 hex", () => {
      expect(getHeatmapColorHex(-0.1)).toBe(0x1acc4d);
    });

    it("边界场景2: 超大值 100 应返回红色 hex", () => {
      expect(getHeatmapColorHex(100)).toBe(0xe6331a);
    });

    it("正常场景: 正常值 0.5 应返回黄色 hex", () => {
      expect(getHeatmapColorHex(0.5)).toBe(0xe6cc1a);
    });
  });
});
