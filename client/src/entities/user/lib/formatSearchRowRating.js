import { USER_PROFILE_COPY } from "../../../shared/config/appUiCopy.js";

/**
 * Короткая строка рейтинга для строки списка пользователей.
 *
 * @param {import('../model/types.js').UserRatingByVotes | undefined} raw
 * @returns {string}
 */
export function formatSearchRowRating(raw) {
  if (!raw || typeof raw !== "object") {
    return USER_PROFILE_COPY.RATING_NONE;
  }
  const { countVotes = 0, totalRating = 0 } = raw;
  if (countVotes === 0) return USER_PROFILE_COPY.RATING_NONE;
  const avg = totalRating / countVotes;
  const rounded = Math.round(avg * 10) / 10;
  return `${rounded} · ${countVotes}`;
}

/**
 * Числовые части рейтинга для карточки пользователя.
 *
 * @param {import('../model/types.js').UserRatingByVotes | undefined} raw
 * @returns {{ average: string; votes: string }}
 */
export function getSearchRowRatingParts(raw) {
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
}

/**
 * @param {import('../model/types.js').UserRatingByVotes | undefined} raw
 * @returns {string}
 */
export function formatSearchRowRatingCompact(raw) {
  const { average, votes } = getSearchRowRatingParts(raw);
  return `${average} · ${votes}`;
}
