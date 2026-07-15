type UserRatingByVotes = {
  countVotes?: number;
  totalRating?: number;
};

export type UserRatingAggregate = {
  average: number | null;
  averageLabel: string;
  countVotes: number;
};

export const parseUserRatingAggregate = (raw: unknown): UserRatingAggregate => {
  if (!raw || typeof raw !== "object") {
    return { average: null, averageLabel: "—", countVotes: 0 };
  }

  const votesRaw = raw as UserRatingByVotes;
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
};
