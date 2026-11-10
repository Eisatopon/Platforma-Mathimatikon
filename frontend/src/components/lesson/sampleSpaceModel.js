const pair = (first, second) => ({
  id: `${first}${second}`,
  label: `${first}${second}`,
  values: [first, second],
});

export const SAMPLE_SPACE_EXPERIMENTS = {
  coin: {
    label: "Ένα νόμισμα",
    shortLabel: "Νόμισμα",
    outcomes: [
      { id: "Κ", label: "Κεφαλή", symbol: "Κ" },
      { id: "Γ", label: "Γράμματα", symbol: "Γ" },
    ],
    events: [
      { id: "heads", label: "Κεφαλή", description: "Το νόμισμα δείχνει Κεφαλή.", test: (outcome) => outcome.id === "Κ" },
      { id: "tails", label: "Γράμματα", description: "Το νόμισμα δείχνει Γράμματα.", test: (outcome) => outcome.id === "Γ" },
      { id: "certain", label: "Κ ή Γ", description: "Πραγματοποιείται οποιοδήποτε αποτέλεσμα κι αν εμφανιστεί.", test: () => true },
      { id: "impossible", label: "Όρθιο νόμισμα", description: "Δεν περιλαμβάνεται στον δηλωμένο δειγματικό χώρο.", test: () => false },
    ],
  },
  twoCoins: {
    label: "Δύο διαδοχικές ρίψεις",
    shortLabel: "2 νομίσματα",
    outcomes: [pair("Κ", "Κ"), pair("Κ", "Γ"), pair("Γ", "Κ"), pair("Γ", "Γ")],
    events: [
      { id: "oneHead", label: "Ακριβώς μία Κ", description: "Μία μόνο από τις δύο ρίψεις δίνει Κεφαλή.", test: (outcome) => outcome.values.filter((value) => value === "Κ").length === 1 },
      { id: "atLeastOneHead", label: "Τουλάχιστον μία Κ", description: "Η πρώτη ή η δεύτερη ρίψη —ή και οι δύο— δίνει Κεφαλή.", test: (outcome) => outcome.values.includes("Κ") },
      { id: "same", label: "Ίδιες όψεις", description: "Οι δύο ρίψεις δίνουν το ίδιο αποτέλεσμα.", test: (outcome) => outcome.values[0] === outcome.values[1] },
      { id: "different", label: "Διαφορετικές όψεις", description: "Οι δύο ρίψεις δίνουν διαφορετικά αποτελέσματα.", test: (outcome) => outcome.values[0] !== outcome.values[1] },
    ],
  },
  die: {
    label: "Μία ρίψη ζαριού",
    shortLabel: "Ζάρι",
    outcomes: Array.from({ length: 6 }, (_, index) => ({ id: String(index + 1), label: String(index + 1), value: index + 1 })),
    events: [
      { id: "even", label: "Άρτιος", description: "Το αποτέλεσμα διαιρείται ακριβώς με το 2.", test: (outcome) => outcome.value % 2 === 0 },
      { id: "greaterFour", label: "Μεγαλύτερος του 4", description: "Το αποτέλεσμα είναι αυστηρά μεγαλύτερο από 4.", test: (outcome) => outcome.value > 4 },
      { id: "multipleThree", label: "Πολλαπλάσιο του 3", description: "Το αποτέλεσμα είναι 3 ή 6.", test: (outcome) => outcome.value % 3 === 0 },
      { id: "greaterSix", label: "Μεγαλύτερος του 6", description: "Κανένα αποτέλεσμα του ζαριού δεν ικανοποιεί τη συνθήκη.", test: (outcome) => outcome.value > 6 },
    ],
  },
  twoDice: {
    label: "Ρίψη δύο ζαριών",
    shortLabel: "2 ζάρια",
    outcomes: Array.from({ length: 6 }, (_, first) => Array.from({ length: 6 }, (_, second) => ({
      id: `${first + 1},${second + 1}`,
      label: `(${first + 1}, ${second + 1})`,
      values: [first + 1, second + 1],
    }))).flat(),
    events: [
      { id: "sumSeven", label: "Άθροισμα 7", description: "Το άθροισμα των δύο ενδείξεων είναι 7.", test: (outcome) => outcome.values[0] + outcome.values[1] === 7 },
      { id: "doubles", label: "Διπλή ένδειξη", description: "Τα δύο ζάρια δείχνουν τον ίδιο αριθμό.", test: (outcome) => outcome.values[0] === outcome.values[1] },
      { id: "sumGreaterEight", label: "Άθροισμα > 8", description: "Το άθροισμα των δύο ενδείξεων είναι μεγαλύτερο από 8.", test: (outcome) => outcome.values[0] + outcome.values[1] > 8 },
      { id: "firstGreater", label: "1ο ζάρι > 2ο", description: "Η ένδειξη του πρώτου ζαριού είναι μεγαλύτερη από του δεύτερου.", test: (outcome) => outcome.values[0] > outcome.values[1] },
    ],
  },
};

export function buildSampleSpaceModel(experimentId, eventId) {
  const experiment = SAMPLE_SPACE_EXPERIMENTS[experimentId] || SAMPLE_SPACE_EXPERIMENTS.die;
  const event = experiment.events.find((item) => item.id === eventId) || experiment.events[0];
  const favourable = experiment.outcomes.filter(event.test);

  return {
    experiment,
    event,
    outcomes: experiment.outcomes,
    favourable,
    outcomeCount: experiment.outcomes.length,
    favourableCount: favourable.length,
    isCertain: favourable.length === experiment.outcomes.length,
    isImpossible: favourable.length === 0,
  };
}

