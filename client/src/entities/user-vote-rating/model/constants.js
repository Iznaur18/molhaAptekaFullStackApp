/** Совпадает с `min` / `max` у `userVoteValue` в `server/models/UserVoteRatingModel.js`. */
export const USER_VOTE_RATING_VALUE_MIN = 1;
export const USER_VOTE_RATING_VALUE_MAX = 10;

/** Порядок полей для визуализации структуры (id + подписи имён). */
export const USER_VOTE_RATING_STRUCTURE_KEYS = [
  "_id",
  "userVoter",
  "userVoterName",
  "userVoteTarget",
  "userVoteTargetName",
  "userVoteValue",
  "createdAt",
  "updatedAt",
];
