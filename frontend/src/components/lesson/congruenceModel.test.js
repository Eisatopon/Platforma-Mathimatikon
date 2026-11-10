import { buildCongruenceModel, CONGRUENCE_MODES, measureTriangle, transformTriangle } from "./congruenceModel";

const closeSides = (actual, expected) => actual.forEach((side, index) => expect(side).toBeCloseTo(expected[index], 9));

describe("geometrically exact triangle congruence models", () => {
  test("constructs all SSS slider positions without violating the triangle inequality", () => {
    for (let bc = 2; bc <= 9; bc += 0.5) {
      const model = buildCongruenceModel("sss", bc);
      closeSides(model.firstMeasures.sides, [6, 5, bc]);
      expect(model.congruent).toBe(true);
      expect(model.firstMeasures.angles.reduce((a, b) => a + b, 0)).toBeCloseTo(180, 9);
    }
  });

  test("keeps the supplied SAS angle between the two supplied sides", () => {
    for (const angle of [30, 60, 120]) {
      const model = buildCongruenceModel("sas", angle);
      expect(model.firstMeasures.angles[0]).toBeCloseTo(angle, 9);
      closeSides(model.firstMeasures.sides.slice(0, 2), [6, 4]);
      expect(model.givenAngles).toEqual([1, 0, 0]);
      expect(model.congruent).toBe(true);
    }
  });

  test("honours both ASA angles and their included side", () => {
    for (const angle of [20, 50, 70]) {
      const model = buildCongruenceModel("asa", angle);
      closeSides(model.firstMeasures.angles, [angle, 40, 140 - angle]);
      expect(model.firstMeasures.sides[0]).toBeCloseTo(6, 9);
    }
  });

  test("gives a genuine AAA counterexample with equal angles and unequal sides", () => {
    const model = buildCongruenceModel("aaa", 1.5);
    closeSides(model.firstMeasures.angles, model.secondMeasures.angles);
    closeSides(model.secondMeasures.sides, model.firstMeasures.sides.map((side) => side * 1.5));
    expect(model.congruent).toBe(false);
    expect(model.sufficient).toBe(false);
  });

  test("constructs two different triangles satisfying the same SSA data", () => {
    const model = buildCongruenceModel("ssa");
    for (const measures of [model.firstMeasures, model.secondMeasures]) {
      closeSides(measures.sides.slice(0, 2), [8, 5]);
      expect(measures.angles[1]).toBeCloseTo(30, 9);
    }
    expect(model.secondMeasures.sides[2] - model.firstMeasures.sides[2]).toBeCloseTo(6, 9);
    expect(model.congruent).toBe(false);
  });

  test("rotation and reflection preserve each corresponding side and angle in every mode", () => {
    CONGRUENCE_MODES.forEach((mode) => {
      const model = buildCongruenceModel(mode.id);
      for (const rotation of [0, 45, 135, 180]) {
        const transformed = measureTriangle(transformTriangle(model.second, rotation, true));
        closeSides(transformed.sides, model.secondMeasures.sides);
        closeSides(transformed.angles, model.secondMeasures.angles);
      }
    });
  });
});
