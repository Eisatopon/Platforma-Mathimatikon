import { reorderForAdaptiveDifficulty } from "./adaptivePractice";

const questions = [
  { id: "current", difficulty: 2 },
  { id: "medium", difficulty: 2 },
  { id: "easy", difficulty: 1 },
  { id: "hard", difficulty: 3 },
];

describe("adaptive practice sequencing", () => {
  test("ανεβάζει τη δυσκολία μετά από σωστή πρώτη προσπάθεια", () => {
    const result = reorderForAdaptiveDifficulty(questions, 1, 2, true);
    expect(result[1].id).toBe("hard");
  });

  test("μειώνει τη δυσκολία όταν χρειάζεται υποστήριξη", () => {
    const result = reorderForAdaptiveDifficulty(questions, 1, 2, false);
    expect(result[1].id).toBe("easy");
  });

  test("δεν μεταβάλλει τις ερωτήσεις που έχουν ήδη ολοκληρωθεί", () => {
    const result = reorderForAdaptiveDifficulty(questions, 1, 2, true);
    expect(result[0]).toEqual(questions[0]);
  });
});
