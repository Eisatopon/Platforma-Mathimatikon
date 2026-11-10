const sortedUnique = (values) => [...new Set(values)].sort((a, b) => a - b);

export function buildSetModel(universeValues, aValues, bValues) {
  const universe = sortedUnique(universeValues);
  const universeSet = new Set(universe);
  const a = sortedUnique(aValues.filter((value) => universeSet.has(value)));
  const b = sortedUnique(bValues.filter((value) => universeSet.has(value)));
  const aSet = new Set(a);
  const bSet = new Set(b);

  return {
    universe,
    a,
    b,
    union: universe.filter((value) => aSet.has(value) || bSet.has(value)),
    intersection: universe.filter((value) => aSet.has(value) && bSet.has(value)),
    onlyA: universe.filter((value) => aSet.has(value) && !bSet.has(value)),
    onlyB: universe.filter((value) => bSet.has(value) && !aSet.has(value)),
    outside: universe.filter((value) => !aSet.has(value) && !bSet.has(value)),
    complementA: universe.filter((value) => !aSet.has(value)),
    complementB: universe.filter((value) => !bSet.has(value)),
    isASubsetOfB: a.every((value) => bSet.has(value)),
    isBSubsetOfA: b.every((value) => aSet.has(value)),
  };
}
