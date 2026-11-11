const RAD = Math.PI / 180;
const EPS = 32 * Number.EPSILON;
const sin = angle => Math.sin(angle * RAD);
const clamp = x => Math.max(-1, Math.min(1, x));
const positive = x => Number.isFinite(x) && x > 0 && x <= 10000;
const angle = x => Number.isFinite(x) && x > 0 && x < 180;
const invalid = reason => ({ valid: false, reason, triangles: [] });

function triangle(a, b, c, A) {
  const x = b * Math.cos(A * RAD);
  const y = b * sin(A);
  const B = Math.atan2(y, c - x) / RAD;
  const C = 180 - A - B;
  return {
    a, b, c, A, B, C,
    points: [{ x: 0, y: 0 }, { x: c, y: 0 }, { x, y }],
    cosineA: Math.cos(A * RAD),
    correction: -2 * b * c * Math.cos(A * RAD),
    ratios: [a / sin(A), b / sin(B), c / sin(C)],
  };
}

export function solveSAS(b, c, A) {
  if (!positive(b) || !positive(c) || !angle(A)) {
    return invalid("Χρειάζονται δύο θετικές πλευρές και περιεχόμενη γωνία μεταξύ 0° και 180°.");
  }
  // Equivalent to the cosine rule, without cancellation for small angles.
  const a = Math.hypot(b - c, 2 * Math.sqrt(b * c) * sin(A / 2));
  return { valid: true, triangles: [triangle(a, b, c, A)] };
}

export function solveSSS(a, b, c) {
  if (![a, b, c].every(positive)) return invalid("Οι τρεις πλευρές πρέπει να είναι θετικές.");
  if (a + b <= c || a + c <= b || b + c <= a) {
    return invalid("Δεν σχηματίζεται τρίγωνο: κάθε πλευρά πρέπει να είναι μικρότερη από το άθροισμα των άλλων δύο. Η ισότητα δίνει συνευθειακά σημεία.");
  }
  const A = Math.acos(clamp((b * b + c * c - a * a) / (2 * b * c))) / RAD;
  return { valid: true, triangles: [triangle(a, b, c, A)] };
}

export function solveAAS(A, B, a) {
  if (!angle(A) || !angle(B) || !positive(a)) return invalid("Χρειάζονται δύο θετικές γωνίες και μία θετική πλευρά.");
  if (A + B >= 180) return invalid("Δεν σχηματίζεται τρίγωνο: οι δύο γωνίες πρέπει να έχουν άθροισμα μικρότερο από 180°.");
  const C = 180 - A - B;
  const b = a * sin(B) / sin(A), c = a * sin(C) / sin(A);
  return { valid: true, triangles: [triangle(a, b, c, A)] };
}

export function solveSSA(A, a, b) {
  if (!angle(A) || !positive(a) || !positive(b)) return invalid("Χρειάζεται έγκυρη γωνία Α και θετικές πλευρές α, β.");
  const sineB = b * sin(A) / a;
  if (sineB > 1 + EPS) return { ...invalid("Ο νόμος ημιτόνων θα έδινε ημΒ>1. Δεν υπάρχει τέτοιο τρίγωνο."), sineB };
  // Snap round-off at sin(B)=1 before asin, whose derivative is unbounded there.
  const B1 = Math.abs(sineB - 1) <= EPS ? 90 : Math.asin(clamp(sineB)) / RAD;
  const candidates = B1 === 90 ? [B1] : [B1, 180 - B1];
  const triangles = candidates.filter(B => 180 - A - B > 1e-8).map(B => {
    const C = 180 - A - B;
    return triangle(a, b, a * sin(C) / sin(A), A);
  });
  return {
    valid: triangles.length > 0,
    reason: triangles.length ? "" : "Οι υποψήφιες γωνίες Β δεν αφήνουν θετική τρίτη γωνία. Δεν υπάρχει τρίγωνο.",
    sineB, candidates, triangles,
  };
}

export const LAW_CASES = [
  { id: "sas", label: "2 πλευρές + περιεχόμενη γωνία", law: "Νόμος συνημιτόνων" },
  { id: "aas", label: "2 γωνίες + πλευρά", law: "Νόμος ημιτόνων" },
  { id: "sss", label: "3 πλευρές", law: "Νόμος συνημιτόνων" },
  { id: "ssa", label: "Μη περιεχόμενη γωνία", law: "Νόμος ημιτόνων με έλεγχο" },
];
