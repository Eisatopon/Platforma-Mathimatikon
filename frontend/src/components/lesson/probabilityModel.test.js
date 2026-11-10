import { buildProbabilityModel, simplifyProbability, simulateProbabilityTrials } from "./probabilityModel";

const traverseSpace = (model) => {
  let index = 0;
  return simulateProbabilityTrials(model, model.denominator, () => (index++ + 0.5) / model.denominator);
};

describe("classical probability and trial sampling", () => {
  test("counts individual balls rather than treating two colours as equally likely", () => {
    const model = buildProbabilityModel("urn", "red", 2, 8);
    expect(model.fraction).toEqual({ numerator: 1, denominator: 5 });
    expect(traverseSpace(model).hits).toBe(2);
  });

  test("distinguishes six ways to make 7 from the single way to make 12", () => {
    const seven = buildProbabilityModel("twoDice", "sumSeven");
    const twelve = seven.outcomes.filter((outcome) => outcome.values[0] + outcome.values[1] === 12);
    expect(seven.fraction).toEqual({ numerator: 1, denominator: 6 });
    expect(twelve).toHaveLength(1);
    expect(traverseSpace(seven).hits).toBe(6);
  });

  test("handles certain and impossible events at the probability endpoints", () => {
    const certain = buildProbabilityModel("urn", "red", 3, 0);
    const impossible = buildProbabilityModel("urn", "red", 0, 3);
    expect(certain.probability).toBe(1);
    expect(impossible.probability).toBe(0);
    expect(traverseSpace(certain).hits).toBe(3);
    expect(traverseSpace(impossible).hits).toBe(0);
    expect(simplifyProbability(0, 6)).toEqual({ numerator: 0, denominator: 1 });
  });

  test("experimental frequency can differ from the theoretical probability", () => {
    const model = buildProbabilityModel("die", "even");
    const trials = simulateProbabilityTrials(model, 10, () => 0);
    expect(model.probability).toBe(0.5);
    expect(trials.hits).toBe(0);
    expect(trials.cumulativeHits).toHaveLength(10);
  });

  test("rejects an empty sample space and invalid probability counts", () => {
    expect(() => buildProbabilityModel("urn", "red", 0, 0)).toThrow(RangeError);
    expect(() => simplifyProbability(7, 6)).toThrow(RangeError);
    expect(() => simplifyProbability(0, 0)).toThrow(RangeError);
  });
});
