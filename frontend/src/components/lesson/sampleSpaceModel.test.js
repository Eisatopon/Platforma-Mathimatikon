import { buildSampleSpaceModel } from "./sampleSpaceModel";

describe("buildSampleSpaceModel", () => {
  test("constructs the four ordered outcomes of two coin tosses", () => {
    const model = buildSampleSpaceModel("twoCoins", "oneHead");
    expect(model.outcomes.map((outcome) => outcome.id)).toEqual(["ΚΚ", "ΚΓ", "ΓΚ", "ΓΓ"]);
    expect(model.favourable.map((outcome) => outcome.id)).toEqual(["ΚΓ", "ΓΚ"]);
  });

  test("finds the six ordered pairs whose dice sum is seven", () => {
    const model = buildSampleSpaceModel("twoDice", "sumSeven");
    expect(model.outcomeCount).toBe(36);
    expect(model.favourableCount).toBe(6);
    expect(model.favourable.map((outcome) => outcome.id)).toEqual(["1,6", "2,5", "3,4", "4,3", "5,2", "6,1"]);
  });

  test("recognizes certain and impossible events", () => {
    expect(buildSampleSpaceModel("coin", "certain").isCertain).toBe(true);
    expect(buildSampleSpaceModel("coin", "impossible").isImpossible).toBe(true);
    expect(buildSampleSpaceModel("die", "greaterSix").favourable).toEqual([]);
  });
});

