import mongoose from "mongoose";

/**
 * Единый ObjectId пользователя для коллекции `carts` (JWT кладёт `_id` строкой).
 *
 * @param {unknown} rawFromJwt
 * @returns {import('mongoose').Types.ObjectId | null}
 */
export const resolveCartUserId = (rawFromJwt) => {
  if (rawFromJwt == null) return null;
  const s = String(rawFromJwt);
  if (!mongoose.isValidObjectId(s)) return null;
  return new mongoose.Types.ObjectId(s);
};
