import { USER_PROFILE_COPY } from "@/shared/config";

type UserRatingByVotes = {
  countVotes?: number;
  totalRating?: number;
};

const getSearchRowRatingParts = (raw: UserRatingByVotes | undefined) => {
  if (!raw || typeof raw !== "object") {
    return { average: "0", votes: "0" };
  }

  const countVotes = Number(raw.countVotes) || 0;
  const totalRating = Number(raw.totalRating) || 0;

  if (countVotes === 0) {
    return { average: "0", votes: "0" };
  }

  const avg = totalRating / countVotes;
  const rounded = Math.round(avg * 10) / 10;

  return {
    average: String(rounded),
    votes: String(countVotes),
  };
};

export const formatSearchRowRatingCompact = (raw: UserRatingByVotes | undefined): string => {
  if (!raw || typeof raw !== "object") {
    return USER_PROFILE_COPY.RATING_NONE;
  }

  const countVotes = Number(raw.countVotes) || 0;
  if (countVotes === 0) {
    return USER_PROFILE_COPY.RATING_NONE;
  }

  const { average, votes } = getSearchRowRatingParts(raw);
  return `${average} · ${votes}`;
};
