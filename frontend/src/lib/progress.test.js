import { levelInfo, PROGRESSION_LEVELS } from "./progress";

describe("fixed progression levels", () => {
  test("uses the named eight-level progression", () => {
    expect(PROGRESSION_LEVELS).toHaveLength(8);
    expect(levelInfo(0)).toMatchObject({ level: 1, levelTitle: "Αφετηρία", nextLevelTitle: "Εξερευνητής" });
    expect(levelInfo(400)).toMatchObject({ level: 2, levelTitle: "Εξερευνητής", xpInLevel: 0, per: 600 });
    expect(levelInfo(1000)).toMatchObject({ level: 3, levelTitle: "Λύτης", xpInLevel: 0 });
  });

  test("caps progress at the final level", () => {
    expect(levelInfo(8400)).toMatchObject({ level: 8, levelTitle: "Δεξιοτέχνης", isMaxLevel: true, levelProgressPct: 100 });
    expect(levelInfo(20000)).toMatchObject({ level: 8, isMaxLevel: true, levelProgressPct: 100 });
  });
});
