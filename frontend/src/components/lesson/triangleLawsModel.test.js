import { solveSAS, solveSSS, solveAAS, solveSSA } from "./triangleLawsModel";

const deg = Math.PI / 180;
function checkTriangle(t) {
  expect(t.A + t.B + t.C).toBeCloseTo(180, 9);
  for (const angle of [t.A, t.B, t.C]) expect(angle).toBeGreaterThan(0);
  for (const [i, length] of [t.a, t.b, t.c].entries()) {
    const p = t.points[(i + 1) % 3], q = t.points[(i + 2) % 3];
    expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeCloseTo(length, 8);
  }
  expect(t.a + t.b).toBeGreaterThan(t.c);
  expect(t.a + t.c).toBeGreaterThan(t.b);
  expect(t.b + t.c).toBeGreaterThan(t.a);
  expect(t.a / Math.sin(t.A * deg)).toBeCloseTo(t.b / Math.sin(t.B * deg), 7);
  expect(t.a / Math.sin(t.A * deg)).toBeCloseTo(t.c / Math.sin(t.C * deg), 7);
}

describe("triangle laws with existence and ambiguity checks", () => {
  test("SAS preserves measured sides, included angle and geometry for acute and obtuse cases", () => {
    for (const b of [2, 6, 12]) for (const c of [2, 8, 12]) for (const A of [15, 30, 60, 90, 120, 165]) {
      const t = solveSAS(b, c, A).triangles[0]; checkTriangle(t);
      expect(t.a * t.a).toBeCloseTo(b * b + c * c - 2 * b * c * Math.cos(A * deg), 9);
      expect(t.A).toBe(A); expect(t.b).toBe(b); expect(t.c).toBe(c);
    }
    expect(solveSAS(6, 8, 60).triangles[0].a ** 2).toBeCloseTo(52, 10);
    expect(solveSAS(6, 8, 90).triangles[0].a).toBeCloseTo(10, 10);
    expect(solveSAS(6, 8, 120).triangles[0].a ** 2).toBeCloseTo(148, 10);
  });

  test("SSS rejects degenerate lengths and recovers the correct opposite angle", () => {
    for (const lengths of [[5, 3, 4], [8, 5, 5], [7, 8, 9], [3, 4, 5]]) checkTriangle(solveSSS(...lengths).triangles[0]);
    expect(solveSSS(8, 5, 5).triangles[0].cosineA).toBeCloseTo(-7 / 25, 12);
    expect(solveSSS(7, 8, 9).triangles[0].cosineA).toBeCloseTo(2 / 3, 12);
    expect(solveSSS(5, 3, 4).triangles[0].A).toBeCloseTo(90, 12);
    for (const args of [[5, 2, 3], [2, 3, 5], [3, 5, 2], [6, 2, 3], [0, 1, 1], [NaN, 3, 4]]) {
      expect(solveSSS(...args).valid).toBe(false);
      expect(solveSSS(...args).triangles).toEqual([]);
    }
  });

  test("AAS uses an opposite known pair and requires a positive third angle", () => {
    for (const A of [15, 30, 60, 120]) for (const B of [15, 45, 90]) {
      const result = solveAAS(A, B, 10);
      if (A + B >= 180) { expect(result.valid).toBe(false); continue; }
      const t = result.triangles[0]; checkTriangle(t);
      expect(t.B).toBeCloseTo(B, 10); expect(t.C).toBeCloseTo(180 - A - B, 10);
    }
    expect(solveAAS(30, 45, 10).triangles[0].b).toBeCloseTo(10 * Math.sqrt(2), 10);
    expect(solveAAS(30, 90, 4).triangles[0].b).toBeCloseTo(8, 10);
    expect(solveAAS(90, 90, 4).valid).toBe(false);
  });

  test("SSA retains both valid supplementary angles and distinguishes zero, one and two triangles", () => {
    const two = solveSSA(30, 5, 5 * Math.sqrt(2));
    expect(two.triangles).toHaveLength(2);
    expect(two.triangles[0].B).toBeCloseTo(45, 10); expect(two.triangles[1].B).toBeCloseTo(135, 10);
    expect(two.triangles[0].C).toBeCloseTo(105, 10); expect(two.triangles[1].C).toBeCloseTo(15, 10);
    const cases = [solveSSA(30, 7, 10), solveSSA(30, 5, 10), solveSSA(30, 10, 10), solveSSA(120, 12, 10)];
    expect(cases.map(x => x.triangles.length)).toEqual([2, 1, 1, 1]);
    [...cases, two].forEach(result => result.triangles.forEach(checkTriangle));
    expect(solveSSA(30, 4, 10).triangles).toHaveLength(0);
    expect(solveSSA(120, 7, 10).triangles).toHaveLength(0);
    expect(solveSSA(30, 5, 10).triangles[0].B).toBeCloseTo(90, 6);
  });

  test("invalid numerical inputs never produce a drawable triangle", () => {
    for (const result of [solveSAS(0, 3, 60), solveSAS(3, 4, 180), solveSAS(3, 4, NaN), solveAAS(0, 30, 4), solveSSA(30, -4, 10), solveSSS(3, Infinity, 5)]) {
      expect(result.valid).toBe(false); expect(result.triangles).toHaveLength(0);
    }
  });
});
