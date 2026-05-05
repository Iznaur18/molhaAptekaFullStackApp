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
