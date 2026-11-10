import { buildSegmentRatioModel, segmentRatioFromPosition } from "./segmentRatioModel";

const value = (fraction) => fraction.numerator / fraction.denominator;

describe("division of a segment in a positive ratio", () => {
  test("distinguishes the ratio of parts from the share of the whole", () => {
    const model = buildSegmentRatioModel(20, 3, 2);
    expect(model.firstCm).toBe(12);
    expect(model.secondCm).toBe(8);
    expect(model.ratio).toEqual({ numerator: 3, denominator: 2 });
    expect(model.firstShare).toEqual({ numerator: 3, denominator: 5 });
    expect(model.inverseRatio).toEqual({ numerator: 2, denominator: 3 });
  });
  test("equivalent ratios locate the identical division point", () => {
    const first = buildSegmentRatioModel(18, 1, 2);
    const second = buildSegmentRatioModel(18, 2, 4);
    expect(first.position).toBe(second.position);
    expect(first.first).toEqual(second.first);
    expect(first.second).toEqual(second.second);
  });
  test("preserves exact lengths when a decimal would need rounding", () => {
    const model = buildSegmentRatioModel(5, 1, 7);
    expect(model.first).toEqual({ numerator: 5, denominator: 8 });
    expect(model.second).toEqual({ numerator: 35, denominator: 8 });
    expect(value(model.first) + value(model.second)).toBe(5);
  });
  test("changing the total scales both lengths but preserves the ratio and position", () => {
    const first = buildSegmentRatioModel(20, 2, 3);
    const doubled = buildSegmentRatioModel(40, 2, 3);
    expect(doubled.firstCm).toBe(2 * first.firstCm);
    expect(doubled.secondCm).toBe(2 * first.secondCm);
    expect(doubled.position).toBe(first.position);
  });
  test("unit conversion changes measurements without changing any ratio", () => {
    const cm = buildSegmentRatioModel(20, 3, 2, "cm");
    const mm = buildSegmentRatioModel(20, 3, 2, "mm");
    const metres = buildSegmentRatioModel(20, 3, 2, "m");
    expect(value(mm.first)).toBe(10 * value(cm.first));
    expect(value(metres.first)).toBe(value(cm.first) / 100);
    expect(mm.ratio).toEqual(metres.ratio);
    expect(value(metres.first) / value(metres.second)).toBeCloseTo(1.5, 12);
  });
  test("all control positions preserve positive parts, their sum, and their intended ratio", () => {
    for (let m = 1; m <= 20; m += 1) for (let n = 1; n <= 20; n += 1) {
      const model = buildSegmentRatioModel(35, m, n);
      expect(model.firstCm + model.secondCm).toBeCloseTo(35, 12);
      expect(model.firstCm / model.secondCm).toBeCloseTo(m / n, 12);
      expect(model.position).toBeGreaterThan(0);
      expect(model.position).toBeLessThan(1);
    }
  });
  test("dragging and keyboard extremes keep M strictly inside AB", () => {
    expect(segmentRatioFromPosition(-1)).toEqual({ m: 1, n: 19 });
    expect(segmentRatioFromPosition(2)).toEqual({ m: 19, n: 1 });
    expect(segmentRatioFromPosition(0.5)).toEqual({ m: 10, n: 10 });
    expect(() => buildSegmentRatioModel(20, 0, 2)).toThrow(RangeError);
    expect(() => segmentRatioFromPosition(NaN)).toThrow(RangeError);
  });
});
