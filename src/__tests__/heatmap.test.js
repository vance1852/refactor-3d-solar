import { describe, it, expect } from "vitest";
import { getHeatmapColor } from "../modules/heatmap.js";

describe("heatmap color calculation logic", () => {
  it("should return green for low occupancy (intensity < 0.4)", () => {
    const result = getHeatmapColor(0.2);
    expect(result.r).toBeCloseTo(0.1, 1);
    expect(result.g).toBeCloseTo(0.8, 1);
    expect(result.b).toBeCloseTo(0.3, 1);
  });

  it("should return yellow for medium occupancy (0.4 < intensity < 0.7)", () => {
    const result = getHeatmapColor(0.5);
    expect(result.r).toBeCloseTo(0.9, 1);
    expect(result.g).toBeCloseTo(0.8, 1);
    expect(result.b).toBeCloseTo(0.1, 1);
  });

  it("should return red for high occupancy (intensity > 0.7)", () => {
    const result = getHeatmapColor(0.85);
    expect(result.r).toBeCloseTo(0.9, 1);
    expect(result.g).toBeCloseTo(0.2, 1);
    expect(result.b).toBeCloseTo(0.1, 1);
  });

  it("should handle boundary case: zero intensity", () => {
    const result = getHeatmapColor(0);
    expect(result.r).toBeCloseTo(0.1, 1);
    expect(result.g).toBeCloseTo(0.8, 1);
    expect(result.b).toBeCloseTo(0.3, 1);
  });

  it("should handle boundary case: exactly 0.4 threshold", () => {
    const result = getHeatmapColor(0.4);
    expect(result.r).toBeCloseTo(0.1, 1);
    expect(result.g).toBeCloseTo(0.8, 1);
  });

  it("should handle boundary case: exactly 0.7 threshold", () => {
    const result = getHeatmapColor(0.7);
    expect(result.r).toBeCloseTo(0.9, 1);
    expect(result.g).toBeCloseTo(0.8, 1);
  });

  it("should handle boundary case: exactly 1.0 max intensity", () => {
    const result = getHeatmapColor(1.0);
    expect(result.r).toBeCloseTo(0.9, 1);
    expect(result.g).toBeCloseTo(0.2, 1);
    expect(result.b).toBeCloseTo(0.1, 1);
  });
});
