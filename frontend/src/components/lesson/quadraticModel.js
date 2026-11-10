const EPSILON = 1e-9;

export function buildQuadraticModel(a, b, c) {
  const discriminant = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  const hasDoubleRoot = Math.abs(discriminant) < EPSILON;
  const roots = discriminant < -EPSILON
    ? []
    : hasDoubleRoot
      ? [vertexX]
      : [(-b - Math.sqrt(discriminant)) / (2 * a), (-b + Math.sqrt(discriminant)) / (2 * a)].sort((x, y) => x - y);

  return {
    discriminant: hasDoubleRoot ? 0 : discriminant,
    vertexX,
    vertexY,
    roots,
    yIntercept: c,
  };
}
