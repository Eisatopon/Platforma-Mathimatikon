import { buildThalesModel, thalesTenthsFromPosition } from "./thalesModel";

const cross = (u, v) => u.x * v.y - u.y * v.x;
const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const value = (fraction) => fraction.numerator / fraction.denominator;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

describe("exact constructions for the intercept theorem", () => {
  test("puts D and E on their stated sides and preserves all four lengths", () => {
    const model = buildThalesModel();
    expect(cross(subtract(model.D, model.A), subtract(model.B, model.A))).toBeCloseTo(0, 12);
    expect(cross(subtract(model.E, model.A), subtract(model.C, model.A))).toBeCloseTo(0, 12);
    expect(distance(model.A, model.D)).toBeCloseTo(4, 12);
    expect(distance(model.D, model.B)).toBeCloseTo(6, 12);
    expect(distance(model.A, model.E)).toBeCloseTo(6, 12);
    expect(distance(model.E, model.C)).toBeCloseTo(9, 12);
  });
  test("parallelism and the three proportionality forms survive every locked position", () => {
    for (const ab of [6, 10, 20]) for (const ac of [6, 15, 24]) for (let k = 1; k <= 9; k += 1) {
      const model = buildThalesModel(k, k, ab, ac);
      expect(cross(subtract(model.E, model.D), subtract(model.C, model.B))).toBeCloseTo(0, 10);
      expect(model.ratios.leftParts).toEqual(model.ratios.rightParts);
      expect(model.ratios.leftWhole).toEqual(model.ratios.rightWhole);
      expect(model.ratios.nearAcross).toEqual(model.ratios.farAcross);
      expect(model.connectorLength / model.baseLength).toBeCloseTo(k / 10, 12);
    }
  });
  test("free unequal positions produce nonparallel lines and unequal ratios", () => {
    for (let left = 1; left <= 9; left += 1) for (let right = 1; right <= 9; right += 1) {
      const model = buildThalesModel(left, right);
      const determinant = cross(subtract(model.E, model.D), subtract(model.C, model.B));
      if (left === right) {
        expect(model.parallel).toBe(true);
        expect(determinant).toBeCloseTo(0, 10);
      } else {
        expect(model.parallel).toBe(false);
        expect(Math.abs(determinant)).toBeGreaterThan(1);
        expect(value(model.ratios.leftParts)).not.toBe(value(model.ratios.rightParts));
      }
    }
  });
  test("does not confuse a part-to-remainder ratio with a part-to-whole ratio", () => {
    const model = buildThalesModel(4, 4);
    expect(model.ratios.leftParts).toEqual({ numerator: 2, denominator: 3 });
    expect(model.ratios.rightWhole).toEqual({ numerator: 2, denominator: 5 });
    expect(model.ratios.nearAcross).toEqual({ numerator: 2, denominator: 3 });
  });
  test("supports the midpoint case in both proportions and the parallel segment length", () => {
    const model = buildThalesModel(5, 5);
    expect(value(model.ratios.leftParts)).toBe(1);
    expect(value(model.ratios.leftWhole)).toBe(0.5);
    expect(model.connectorLength).toBeCloseTo(model.baseLength / 2, 12);
  });
  test("dragging and keyboard extremes never create zero denominators", () => {
    expect(thalesTenthsFromPosition(-5)).toBe(1);
    expect(thalesTenthsFromPosition(4)).toBe(9);
    expect(() => buildThalesModel(0, 4)).toThrow(RangeError);
    expect(() => buildThalesModel(4, 10)).toThrow(RangeError);
    expect(() => thalesTenthsFromPosition(NaN)).toThrow(RangeError);
  });
});
