import { buildSampleSpaceModel } from "./sampleSpaceModel";

export function simplifyProbability(numerator, denominator) {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator <= 0 || numerator < 0 || numerator > denominator) {
    throw new RangeError("Η πιθανότητα χρειάζεται 0 ≤ ευνοϊκά ≤ δυνατά και μη κενό δειγματικό χώρο.");
  }
  let a = numerator;
  let b = denominator;
  while (b) [a, b] = [b, a % b];
  return { numerator: numerator / a, denominator: denominator / a };
}

export function buildProbabilityModel(experimentId, eventId, red = 4, blue = 6) {
  let sample;
  if (experimentId === "urn") {
    if (![red, blue].every((value) => Number.isInteger(value) && value >= 0 && value <= 10) || red + blue === 0) {
      throw new RangeError("Η κάλπη πρέπει να έχει από 1 έως 20 μπάλες, έως 10 από κάθε χρώμα.");
    }
    const outcomes = [
      ...Array.from({ length: red }, (_, index) => ({ id: `R${index + 1}`, label: `Κ${index + 1}`, colour: "red" })),
      ...Array.from({ length: blue }, (_, index) => ({ id: `B${index + 1}`, label: `Μ${index + 1}`, colour: "blue" })),
    ];
    sample = { outcomes, favourable: outcomes.filter((outcome) => outcome.colour === "red"), event: { label: "Κόκκινη μπάλα" } };
  } else {
    sample = buildSampleSpaceModel(experimentId, eventId);
  }
  const denominator = sample.outcomes.length;
  const numerator = sample.favourable.length;
  return { ...sample, numerator, denominator, fraction: simplifyProbability(numerator, denominator), probability: numerator / denominator };
}

// Count distinct, equally likely elementary outcomes, including each individual
// ball. Two colour labels in an urn are not two equally likely outcomes.
export function simulateProbabilityTrials(model, count, random = Math.random) {
  if (!Number.isInteger(count) || count < 0 || count > 10000) throw new RangeError("Μη έγκυρο πλήθος δοκιμών.");
  const favourable = new Set(model.favourable.map((outcome) => outcome.id));
  let hits = 0;
  const cumulativeHits = [];
  for (let index = 0; index < count; index += 1) {
    const outcome = model.outcomes[Math.floor(random() * model.denominator)];
    if (favourable.has(outcome.id)) hits += 1;
    cumulativeHits.push(hits);
  }
  return { hits, trials: count, cumulativeHits };
}
