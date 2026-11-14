import { levelInfo, PROGRESSION_LEVELS, recordPracticeResult, getProgress, SECOND_ATTEMPT_WEIGHT } from "./progress";
import content from "../data/content.json";

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

describe("second-attempt credit", () => {
  beforeEach(() => localStorage.clear());

  test("matches the weight every lesson declares", () => {
    const declared = new Set(Object.values(content.lessonDetails).map((lesson) => lesson.learningSpecification?.secondAttemptWeight));
    expect([...declared]).toEqual([SECOND_ATTEMPT_WEIGHT]);
  });

  test("lesson score, skill score and XP use the same weight", () => {
    // 5 first-try and 5 second-try answers out of 10: 5 + 5 * 0.6 = 8 equivalent correct answers.
    recordPracticeResult("weight-check", {
      firstTryCorrect: 5, secondTryCorrect: 5, total: 10,
      skillResults: { skill: { earned: 5 + 5 * SECOND_ATTEMPT_WEIGHT, total: 10 } },
    });
    const progress = getProgress();
    expect(progress.mastery["weight-check"]).toMatchObject({ lastScore: 80, firstTryAccuracy: 50, successfulSessions: 1, level: 1 });
    expect(progress.skills["weight-check::skill"]).toMatchObject({ lastScore: 80, successfulSessions: 1 });
    expect(progress.completed["weight-check"]).toMatchObject({ correct: 8, total: 10 });
  });

  test("a session answered only on the second attempt does not count as a success", () => {
    recordPracticeResult("second-only", { firstTryCorrect: 0, secondTryCorrect: 10, total: 10 });
    expect(getProgress().mastery["second-only"]).toMatchObject({ lastScore: 60, successfulSessions: 0 });
  });
});
