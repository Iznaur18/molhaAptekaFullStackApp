/**
 * @param {number} score
 * @returns {"danger" | "warning" | "success"}
 */
export function resolveVoteScoreTone(score) {
  if (score <= 3) {
    return "danger";
  }
  if (score <= 6) {
    return "warning";
  }
  return "success";
}
