import { reduceSegmentFraction } from "./segmentRatioModel";

export const HOMOTHETY_VERTICES = [{ x: 2, y: 1 }, { x: 6, y: 1 }, { x: 2, y: 4 }];
const finitePoint = (p) => p && Number.isFinite(p.x) && Number.isFinite(p.y);
export function homothetyImage(point, centre, ratio) {
  if (!finitePoint(point) || !finitePoint(centre) || !Number.isFinite(ratio) || ratio === 0) throw new RangeError("Χρειάζονται έγκυρα σημεία και μη μηδενικός λόγος.");
  return { x: centre.x + ratio * (point.x - centre.x), y: centre.y + ratio * (point.y - centre.y) };
}
export function buildHomothetyModel(quarters = 8, centre = { x: 0, y: 0 }) {
  if (!Number.isInteger(quarters) || Math.abs(quarters) > 12 || quarters === 0) throw new RangeError("Ο λόγος πρέπει να είναι μη μηδενικό πολλαπλάσιο του 1/4 στο [-3,3].");
  if (!finitePoint(centre) || !Number.isInteger(centre.x * 2) || !Number.isInteger(centre.y * 2)) throw new RangeError("Το κέντρο τοποθετείται σε μισές μονάδες.");
  const ratio = quarters / 4;
  const absolute = Math.abs(ratio);
  const vertices = HOMOTHETY_VERTICES.map((p) => ({ ...p }));
  return { centre: { ...centre }, ratio, quarters, vertices, images: vertices.map((p) => homothetyImage(p, centre, ratio)),
    direction: ratio > 0 ? "same" : "opposite",
    size: absolute > 1 ? "enlargement" : absolute < 1 ? "reduction" : "equal",
    factors: { signed: { ...reduceSegmentFraction(Math.abs(quarters), 4), numerator: Math.sign(quarters) * reduceSegmentFraction(Math.abs(quarters), 4).numerator }, length: reduceSegmentFraction(Math.abs(quarters), 4), area: reduceSegmentFraction(quarters * quarters, 16) },
    original: { sides: [4, 5, 3], perimeter: 12, area: 6 },
    transformed: { sides: [4, 5, 3].map((s) => s * absolute), perimeter: 12 * absolute, area: 6 * ratio * ratio },
  };
}
export function homothetyQuartersFromIndex(index) {
  if (!Number.isInteger(index) || index < 0 || index > 23) throw new RangeError("Μη έγκυρη θέση λόγου.");
  return index < 12 ? index - 12 : index - 11;
}
export function homothetyIndexFromQuarters(quarters) {
  if (!Number.isInteger(quarters) || quarters === 0 || Math.abs(quarters) > 12) throw new RangeError("Μη έγκυρος λόγος.");
  return quarters < 0 ? quarters + 12 : quarters + 11;
}
export function constrainHomothetyCentre(point) {
  if (!finitePoint(point)) throw new RangeError("Μη έγκυρο κέντρο.");
  return { x: Math.max(-4, Math.min(0, Math.round(point.x * 2) / 2)), y: Math.max(-2, Math.min(3, Math.round(point.y * 2) / 2)) };
}
