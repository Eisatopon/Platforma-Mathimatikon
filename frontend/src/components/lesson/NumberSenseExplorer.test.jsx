import { buildNumberModel } from "./NumberSenseExplorer";

describe("buildNumberModel", () => {
  test("αναλύει σωστά την αξία θέσης", () => {
    const model = buildNumberModel(30407, 1000);
    expect(model.digits).toEqual([3, 0, 4, 0, 7]);
    expect(model.expanded).toBe("30.000 + 400 + 7");
  });

  test("στρογγυλοποιεί στην πλησιέστερη χιλιάδα", () => {
    const model = buildNumberModel(30407, 1000);
    expect(model.lower).toBe(30000);
    expect(model.upper).toBe(31000);
    expect(model.rounded).toBe(30000);
  });

  test("στο μέσο στρογγυλοποιεί προς τα επάνω", () => {
    expect(buildNumberModel(30500, 1000).rounded).toBe(31000);
    expect(buildNumberModel(8450, 100).rounded).toBe(8500);
  });

  test("περιορίζει την είσοδο στο επιτρεπτό διάστημα", () => {
    expect(buildNumberModel(-12, 10).safeNumber).toBe(0);
    expect(buildNumberModel(120000, 1000).safeNumber).toBe(99999);
    expect(buildNumberModel(Number.NaN, 100).safeNumber).toBe(0);
  });
});
