export function nextTrustScore(current, { daysClean = 0, helpfulVotes = 0, reports = 0, infractions = 0 } = {}) {
  let s = current
  s += Math.min(30, Math.floor(daysClean / 10))
  s += Math.min(20, helpfulVotes * 2)
  s -= Math.min(40, reports * 5 + infractions * 10)
  s = Math.max(0, Math.min(100, s))
  return s
}
