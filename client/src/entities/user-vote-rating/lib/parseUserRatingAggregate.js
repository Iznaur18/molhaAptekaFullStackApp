/**
 * @param {unknown} raw
 * @returns {{ average: number | null; averageLabel: string; countVotes: number }}
 */
export function parseUserRatingAggregate(raw) {
  if (!raw || typeof raw !== "object") {
    return { average: null, averageLabel: "—", countVotes: 0 };
  }

  const votesRaw = /** @type {{ countVotes?: number; totalRating?: number }} */ (raw);
  const countVotes = Number(votesRaw.countVotes) || 0;
  const totalRating = Number(votesRaw.totalRating) || 0;

  if (countVotes === 0) {
    return { average: null, averageLabel: "—", countVotes: 0 };
  }

  const average = Math.round((totalRating / countVotes) * 10) / 10;
  return {
    average,
    averageLabel: String(average),
    countVotes,
  };
}
