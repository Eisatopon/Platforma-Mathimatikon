import { buildSetModel } from "./setModel";

describe("buildSetModel", () => {
  test("computes union, intersection and differences without repetitions", () => {
    const model = buildSetModel([1, 2, 3, 4, 5, 6], [1, 2, 3, 4], [3, 4, 5]);
    expect(model.union).toEqual([1, 2, 3, 4, 5]);
    expect(model.intersection).toEqual([3, 4]);
    expect(model.onlyA).toEqual([1, 2]);
    expect(model.onlyB).toEqual([5]);
  });

  test("computes complements relative to the stated universe", () => {
    const model = buildSetModel([1, 2, 3, 4, 5], [2, 4], [1, 2]);
    expect(model.complementA).toEqual([1, 3, 5]);
    expect(model.outside).toEqual([3, 5]);
  });

  test("recognizes subsets and disjoint sets", () => {
    const subset = buildSetModel([1, 2, 3, 4], [2, 4], [1, 2, 3, 4]);
    expect(subset.isASubsetOfB).toBe(true);
    expect(subset.isBSubsetOfA).toBe(false);

    const disjoint = buildSetModel([1, 2, 3, 4], [1, 2], [3, 4]);
    expect(disjoint.intersection).toEqual([]);
  });
});
