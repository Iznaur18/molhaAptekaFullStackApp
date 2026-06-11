import mongoose from "mongoose";

/**
 * @param {unknown} rawFromJwt
 * @returns {import('mongoose').Types.ObjectId | null}
 */
export const resolveFavoritesUserId = (rawFromJwt) => {
  if (rawFromJwt == null) return null;
  const s = String(rawFromJwt);
  if (!mongoose.isValidObjectId(s)) return null;
  return new mongoose.Types.ObjectId(s);
};
