import { UserModel } from "../../models/index.js";

/**
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function bumpUserAuthTokenVersion(userId) {
  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $inc: { authTokenVersion: 1 } },
    { returnDocument: "after" },
  ).select("authTokenVersion");

  return Number(updated?.authTokenVersion ?? 0);
}

/**
 * @param {import('mongoose').Document | Record<string, unknown>} user
 * @returns {number}
 */
export function resolveUserAuthTokenVersion(user) {
  const version = Number(user?.authTokenVersion ?? 0);
  return Number.isFinite(version) && version >= 0 ? version : 0;
}

/**
 * @param {unknown} tokenVersion
 * @param {import('mongoose').Document | Record<string, unknown>} user
 */
export function isRefreshTokenVersionValid(tokenVersion, user) {
  const decodedVersion = Number(tokenVersion ?? 0);
  const currentVersion = resolveUserAuthTokenVersion(user);
  return (
    Number.isFinite(decodedVersion) &&
    decodedVersion >= 0 &&
    decodedVersion === currentVersion
  );
}
