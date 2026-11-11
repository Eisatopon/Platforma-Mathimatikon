import { buildCongruenceModel, measureTriangle, transformTriangle } from "./congruenceModel";

export const SIMILARITY_MODES = [
  { id: "aa", label: "ΓΓ", parameter: "Γωνία Α και αντίστοιχη γωνία", min: 20, max: 70, step: 5, initial: 50, unit: "°" },
  { id: "sss", label: "ΠΠΠ", parameter: "Μήκος ΒΓ στο αρχικό τρίγωνο", min: 2, max: 9, step: 0.5, initial: 4, unit: "" },
  { id: "sas", label: "ΠΓΠ", parameter: "Περιεχόμενη γωνία Α και αντίστοιχη", min: 30, max: 120, step: 5, initial: 60, unit: "°" },
  { id: "ssa", label: "ΠΠΓ: αρκεί;", initial: 0 },
];
export const SIMILARITY_EDGES = [[0, 1], [0, 2], [1, 2]];
export const similarityNames = (renamed = false) => renamed ? ["Ε", "Ζ", "Δ"] : ["Δ", "Ε", "Ζ"];
export function buildSimilarityModel(modeId = "aa", quarters = 6, parameter, rotation = 25, reflected = false) {
  const mode = SIMILARITY_MODES.find((m) => m.id === modeId);
  if (!mode || !Number.isInteger(quarters) || quarters < 1 || quarters > 12 || !Number.isFinite(rotation)) throw new RangeError("Χρειάζεται έγκυρο κριτήριο και θετικός λόγος από 1/4 έως 3.");
  const base = buildCongruenceModel(modeId === "aa" ? "asa" : modeId, parameter ?? mode.initial);
  const ratio = quarters / 4;
  const first = base.first.map((p) => ({ ...p }));
  const second = transformTriangle(base.second.map((p) => ({ x: p.x * ratio, y: p.y * ratio })), rotation, reflected);
  const firstMeasures = measureTriangle(first), secondMeasures = measureTriangle(second);
  const ratios = firstMeasures.sides.map((side, i) => secondMeasures.sides[i] / side);
  const similar = ratios.every((r) => Math.abs(r - ratio) < 1e-9);
  const givenSideIndices = modeId === "aa" ? [] : modeId === "sss" ? [0, 1, 2] : [0, 1];
  const givenAngleIndices = modeId === "aa" ? [0, 1] : modeId === "sss" ? [] : modeId === "sas" ? [0] : [1];
  return { mode, ratio, quarters, parameter: base.parameter, first, second, firstMeasures, secondMeasures, ratios, similar,
    firstPerimeter: firstMeasures.sides.reduce((s, x) => s + x, 0), secondPerimeter: secondMeasures.sides.reduce((s, x) => s + x, 0),
    givenSideIndices, givenAngleIndices,
    explanation: {
      aa: "Δύο αντίστοιχες γωνίες είναι ίσες. Η τρίτη προκύπτει από το άθροισμα 180°. Το ΓΓ αρκεί για ομοιότητα, με οποιονδήποτε θετικό λόγο κ.",
      sss: "Και οι τρεις αντίστοιχοι λόγοι πλευρών είναι ίσοι. Εφαρμόζεται το ΠΠΠ ομοιότητας· οι πλευρές είναι ανάλογες, όχι υποχρεωτικά ίσες.",
      sas: "Οι δύο γνωστοί λόγοι πλευρών είναι ίσοι και η γωνία ανάμεσα σε αυτές τις πλευρές είναι ίση. Η περιεχόμενη γωνία είναι απαραίτητη για το ΠΓΠ.",
      ssa: "Οι δύο γνωστοί λόγοι πλευρών είναι κ και η γνωστή γωνία είναι 30°, αλλά δεν βρίσκεται ανάμεσα στις δύο γνωστές πλευρές. Ο τρίτος λόγος διαφέρει: αυτά τα δεδομένα δεν εξασφαλίζουν γενικά ομοιότητα.",
    }[modeId],
  };
}
