export const SEGMENT_UNITS = {
  cm: { label: "Εκατοστά", numerator: 1, denominator: 1 },
  mm: { label: "Χιλιοστά", numerator: 10, denominator: 1 },
  m: { label: "Μέτρα", numerator: 1, denominator: 100 },
};

export function reduceSegmentFraction(numerator, denominator) {
  if (!Number.isInteger(numerator) || numerator < 0 || !Number.isInteger(denominator) || denominator <= 0) throw new RangeError("Χρειάζεται μη αρνητικός ακέραιος αριθμητής και θετικός παρονομαστής.");
  let a = numerator;
  let b = denominator;
  while (b) [a, b] = [b, a % b];
  return { numerator: numerator / a, denominator: denominator / a };
}

export function segmentFractionLatex(fraction) {
  return fraction.denominator === 1 ? String(fraction.numerator) : `\\frac{${fraction.numerator}}{${fraction.denominator}}`;
}

export function buildSegmentRatioModel(totalCm, m, n, unit = "cm") {
  if (![totalCm, m, n].every((value) => Number.isInteger(value) && value > 0)) throw new RangeError("Το μήκος και τα μέρη του λόγου πρέπει να είναι θετικοί ακέραιοι.");
  const scale = SEGMENT_UNITS[unit];
  if (!scale) throw new RangeError("Άγνωστη μονάδα μήκους.");
  const ratio = reduceSegmentFraction(m, n);
  const sum = m + n;
  return {
    m, n, sum, unit, totalCm,
    ratio,
    position: m / sum,
    firstCm: totalCm * m / sum,
    secondCm: totalCm * n / sum,
    first: reduceSegmentFraction(totalCm * m * scale.numerator, sum * scale.denominator),
    second: reduceSegmentFraction(totalCm * n * scale.numerator, sum * scale.denominator),
    total: reduceSegmentFraction(totalCm * scale.numerator, scale.denominator),
    onePart: reduceSegmentFraction(totalCm * scale.numerator, sum * scale.denominator),
    firstShare: reduceSegmentFraction(m, sum),
    secondShare: reduceSegmentFraction(n, sum),
    inverseRatio: reduceSegmentFraction(n, m),
  };
}

// Dragging uses interior twentieths so neither denominator segment vanishes.
export function segmentRatioFromPosition(position) {
  if (!Number.isFinite(position)) throw new RangeError("Μη έγκυρη θέση σημείου.");
  const first = Math.max(1, Math.min(19, Math.round(position * 20)));
  return { m: first, n: 20 - first };
}
