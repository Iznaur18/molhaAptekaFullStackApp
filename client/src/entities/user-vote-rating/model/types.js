/**
 * Значение одного голоса (диапазон как на сервере: см. `USER_VOTE_RATING_VALUE_*` в `./constants.js`).
 *
 * @typedef {number} UserVoteRatingVoteValue
 */

/**
 * Документ голоса рейтинга в JSON (lean), соответствует `UserVoteRating` в `server/models/UserVoteRatingModel.js`.
 * Без `populate` поля `userVoter` и `userVoteTarget` — строки ObjectId.
 * `userVoterName` / `userVoteTargetName` — только клиент или populate (`userName`), в Mongo-схеме нет.
 *
 * @typedef {object} UserVoteRating
 * @property {string} _id
 * @property {string} userVoter
 * @property {string} [userVoterName]
 * @property {string} userVoteTarget
 * @property {string} [userVoteTargetName]
 * @property {UserVoteRatingVoteValue} userVoteValue
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
