export function reorderForAdaptiveDifficulty(items, nextIndex, currentDifficulty, firstTrySuccess) {
  if (nextIndex >= items.length) return items;
  const targetDifficulty = firstTrySuccess
    ? Math.min(3, (currentDifficulty || 2) + 1)
    : Math.max(1, (currentDifficulty || 2) - 1);
  const candidates = items.slice(nextIndex);
  let bestOffset = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  candidates.forEach((candidate, offset) => {
    const distance = Math.abs((candidate.difficulty || 2) - targetDifficulty);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestOffset = offset;
    }
  });
  if (bestOffset === 0) return items;
  const reordered = [...items];
  const selectedIndex = nextIndex + bestOffset;
  [reordered[nextIndex], reordered[selectedIndex]] = [reordered[selectedIndex], reordered[nextIndex]];
  return reordered;
}
