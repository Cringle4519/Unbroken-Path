export function trustLevelFromScore(score) {
  if (score >= 100) return 4
  if (score >= 75) return 3
  if (score >= 50) return 2
  if (score >= 25) return 1
  return 0
}
