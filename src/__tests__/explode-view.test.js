import { describe, it, expect } from "vitest";
import { calculateExplodedPosition, ExplodeViewController } from "../modules/explode-view.js";

describe("explode view position calculation logic", () => {
  it("should calculate correct Y positions for floor 0 with 50% progress (normal scenario)", () => {
    const result = calculateExplodedPosition(0, 0, 0.5);
    expect(result.slabY).toBe(0);
    expect(result.furnitureY).toBe(0);
  });

  it("should calculate correct Y positions for middle floor with 50% progress", () => {
    const result = calculateExplodedPosition(2, 7, 0.5);
    expect(result.slabY).toBeGreaterThan(7);
    expect(result.furnitureY).toBeGreaterThan(7);
    expect(result.heatmapY).toBeGreaterThan(result.slabY);
  });

  it("should calculate correct Y positions for top floor with 100% progress", () => {
    const result = calculateExplodedPosition(5, 5 * 3.5, 1.0);
    expect(result.slabY).toBeGreaterThan(17.5);
    expect(result.furnitureY).toBeGreaterThan(17.5);
    expect(result.heatmapY).toBe(result.slabY + 0.2);
  });

  it("should handle boundary case: zero progress (collapsed state)", () => {
    const result = calculateExplodedPosition(3, 10.5, 0);
    expect(result.slabY).toBe(10.5);
    expect(result.furnitureY).toBe(10.5);
  });

  it("should handle boundary case: negative floor index", () => {
    const result = calculateExplodedPosition(-1, 0, 0.5);
    expect(result.slabY).toBeLessThan(0);
  });

  it("should handle boundary case: negative progress", () => {
    const result = calculateExplodedPosition(2, 7, -0.5);
    expect(result.slabY).toBeLessThan(7);
  });

  it("should handle boundary case: progress greater than 1.0", () => {
    const result = calculateExplodedPosition(2, 7, 2.0);
    const normalResult = calculateExplodedPosition(2, 7, 1.0);
    expect(result.slabY).toBeGreaterThan(normalResult.slabY);
  });
});

describe("ExplodeViewController class", () => {
  it("should initialize with correct default state", () => {
    const controller = new ExplodeViewController();
    expect(controller.isExploded).toBe(false);
    expect(controller.progress).toBe(0);
    expect(controller.isAnimating).toBe(false);
  });

  it("should toggle explode state correctly", () => {
    const controller = new ExplodeViewController();
    const result = controller.toggle();
    expect(result).toBe(true);
    expect(controller.isExploded).toBe(true);
    expect(controller.isAnimating).toBe(true);
  });

  it("should reset to collapsed state", () => {
    const controller = new ExplodeViewController();
    controller.toggle();
    controller.reset();
    expect(controller.isExploded).toBe(false);
    expect(controller.isAnimating).toBe(true);
  });
});
