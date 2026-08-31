// Compares dotted version strings part-by-part as numbers, so "1.10" is
// correctly newer than "1.9" (a plain string compare would get that wrong).
// Returns positive if a > b, negative if a < b, 0 if equal.
export function compareVersions(a: string, b: string): number {
  const partsA = a.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0)
  const partsB = b.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0)
  const len = Math.max(partsA.length, partsB.length)
  for (let i = 0; i < len; i++) {
    const diff = (partsA[i] || 0) - (partsB[i] || 0)
    if (diff !== 0) return diff
  }
  return 0
}
