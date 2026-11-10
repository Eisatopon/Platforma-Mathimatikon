import { buildQuadraticModel } from "./quadraticModel";

describe("buildQuadraticModel", () => {
  test("υπολογίζει κορυφή και δύο ρίζες", () => {
    const model = buildQuadraticModel(1, -4, 3);
    expect(model.vertexX).toBe(2);
    expect(model.vertexY).toBe(-1);
    expect(model.roots).toEqual([1, 3]);
  });

  test("αναγνωρίζει τη διπλή ρίζα", () => {
    const model = buildQuadraticModel(1, -4, 4);
    expect(model.discriminant).toBe(0);
    expect(model.roots).toEqual([2]);
  });

  test("αναγνωρίζει ότι δεν υπάρχουν πραγματικές ρίζες", () => {
    const model = buildQuadraticModel(1, 0, 2);
    expect(model.discriminant).toBeLessThan(0);
    expect(model.roots).toEqual([]);
  });
});
