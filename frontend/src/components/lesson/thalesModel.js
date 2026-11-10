import { reduceSegmentFraction } from "./segmentRatioModel";

const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

export function buildThalesModel(leftTenths = 4, rightTenths = 4, ab = 10, ac = 15) {
  if (![leftTenths, rightTenths].every((value) => Number.isInteger(value) && value >= 1 && value <= 9)) throw new RangeError("Τα σημεία πρέπει να βρίσκονται αυστηρά στο εσωτερικό των πλευρών.");
  if (![ab, ac].every((value) => Number.isInteger(value) && value > 0)) throw new RangeError("Τα μήκη των πλευρών πρέπει να είναι θετικοί ακέραιοι.");
  const A = { x: 0, y: 0 };
  // Two non-collinear 3-4-5 directions preserve the stated side lengths exactly.
  const B = { x: -3 * ab / 5, y: 4 * ab / 5 };
  const C = { x: 3 * ac / 5, y: 4 * ac / 5 };
  const D = { x: B.x * leftTenths / 10, y: B.y * leftTenths / 10 };
  const E = { x: C.x * rightTenths / 10, y: C.y * rightTenths / 10 };
  const parallel = leftTenths === rightTenths;
  return {
    A, B, C, D, E, ab, ac, leftTenths, rightTenths, parallel,
    lengths: {
      AD: reduceSegmentFraction(ab * leftTenths, 10),
      DB: reduceSegmentFraction(ab * (10 - leftTenths), 10),
      AE: reduceSegmentFraction(ac * rightTenths, 10),
      EC: reduceSegmentFraction(ac * (10 - rightTenths), 10),
    },
    ratios: {
      leftParts: reduceSegmentFraction(leftTenths, 10 - leftTenths),
      rightParts: reduceSegmentFraction(rightTenths, 10 - rightTenths),
      leftWhole: reduceSegmentFraction(leftTenths, 10),
      rightWhole: reduceSegmentFraction(rightTenths, 10),
      nearAcross: reduceSegmentFraction(ab * leftTenths, ac * rightTenths),
      farAcross: reduceSegmentFraction(ab * (10 - leftTenths), ac * (10 - rightTenths)),
    },
    baseLength: distance(B, C),
    connectorLength: distance(D, E),
  };
}

export function thalesTenthsFromPosition(fraction) {
  if (!Number.isFinite(fraction)) throw new RangeError("Μη έγκυρη θέση σημείου.");
  return Math.max(1, Math.min(9, Math.round(fraction * 10)));
}
