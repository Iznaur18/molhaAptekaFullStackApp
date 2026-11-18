import mongoose from "mongoose";

import {
  buildUserBlockedNotificationMessage,
  IN_APP_NOTIFICATION_KIND_USER_BLOCKED,
  USER_BLOCK_CANNOT_BLOCK_SELF_MESSAGE,
  USER_BLOCK_LIMIT_REACHED_MESSAGE,
  USER_BLOCK_MAX_PER_USER,
  USER_BLOCK_LIST_MAX_LIMIT,
  USER_BLOCK_NOT_BLOCKED_MESSAGE,
  USER_BLOCK_TARGET_NOT_FOUND_MESSAGE,
} from "../../constants/userBlockConstants.js";
import { AppError } from "../../errors/AppError.js";
import { UserBlockModel, UserFollowModel, UserModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { createUserInAppNotification } from "./userInAppNotifications.js";
import { removeBlockedSellerProductsFromUserCart } from "./userBlockCartCleanup.js";

const USER_LIST_SELECT =
  "userName userAvatarUrl userAvatarFocus isPremiumUser isUserDataConfirmed userRatingByVotes userLoyaltyPoints";

/**
 * @param {string} blockerId
 * @param {string} blockedId
 */
export async function isUserBlockedBy(blockerId, blockedId) {
  if (!blockerId || !blockedId || blockerId === blockedId) {
    return false;
  }
  const row = await UserBlockModel.findOne({ blockerId, blockedId })
    .select("_id")
    .lean();
  return Boolean(row);
}

/**
 * @param {string} buyerId
 * @param {string[]} sellerIds
 * @returns {Promise<Set<string>>}
 */
export async function getSellerIdsBlockingBuyer(buyerId, sellerIds) {
  const safeBuyerId = String(buyerId ?? "");
  const ids = [...new Set(sellerIds.map((id) => String(id)).filter(Boolean))];
  if (!safeBuyerId || ids.length === 0) {
    return new Set();
  }

  const rows = await UserBlockModel.find({
    blockerId: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    blockedId: safeBuyerId,
  })
    .select("blockerId")
    .lean();

  return new Set(rows.map((row) => String(row.blockerId)));
}

/**
 * @param {string} blockerId
 * @param {string} blockedId
 */
async function purgeFollowRelationsBetween(blockerId, blockedId) {
  await UserFollowModel.deleteMany({
    $or: [
      { followerId: blockerId, followingId: blockedId },
      { followerId: blockedId, followingId: blockerId },
    ],
  });
}

/**
 * @param {{ blockerId: string; blockedId: string; blockerName?: string | null }} params
 */
export function scheduleUserBlockSideEffects({
  blockerId,
  blockedId,
  blockerName = null,
}) {
  setImmediate(() => {
    void (async () => {
      try {
        await purgeFollowRelationsBetween(blockerId, blockedId);
        await removeBlockedSellerProductsFromUserCart(blockerId, blockedId);
        await createUserInAppNotification({
          userId: blockedId,
          kind: IN_APP_NOTIFICATION_KIND_USER_BLOCKED,
          message: buildUserBlockedNotificationMessage(blockerName),
          actorUserId: blockerId,
        });
      } catch (error) {
        logServerEvent("error", {
          event: "user_block_side_effects_failed",
          blockerId,
          blockedId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    })();
  });
}

/**
 * @param {string} blockerId
 * @param {string} blockedId
 */
export async function blockUser(blockerId, blockedId) {
  if (String(blockerId) === String(blockedId)) {
    throw new AppError(400, USER_BLOCK_CANNOT_BLOCK_SELF_MESSAGE);
  }

  const [target, blocker] = await Promise.all([
    UserModel.findById(blockedId).select("_id").lean(),
    UserModel.findById(blockerId).select("userName").lean(),
  ]);
  if (!target) {
    throw new AppError(404, USER_BLOCK_TARGET_NOT_FOUND_MESSAGE);
  }

  const existing = await UserBlockModel.findOne({ blockerId, blockedId })
    .select("_id")
    .lean();
  if (existing) {
    return {
      message: "Пользователь уже заблокирован",
      isBlockedByMe: true,
      blockedAt: null,
      alreadyBlocked: true,
    };
  }

  const count = await UserBlockModel.countDocuments({ blockerId });
  if (count >= USER_BLOCK_MAX_PER_USER) {
    throw new AppError(400, USER_BLOCK_LIMIT_REACHED_MESSAGE);
  }

  const doc = await UserBlockModel.create({ blockerId, blockedId });

  scheduleUserBlockSideEffects({
    blockerId,
    blockedId,
    blockerName: blocker?.userName,
  });

  return {
    message: "Пользователь заблокирован",
    isBlockedByMe: true,
    blockedAt: doc.createdAt?.toISOString?.() ?? null,
    alreadyBlocked: false,
  };
}

/**
 * @param {string} blockerId
 * @param {string} blockedId
 */
export async function unblockUser(blockerId, blockedId) {
  const result = await UserBlockModel.deleteOne({ blockerId, blockedId });
  if (result.deletedCount === 0) {
    throw new AppError(404, USER_BLOCK_NOT_BLOCKED_MESSAGE);
  }
  return {
    message: "Пользователь разблокирован",
    isBlockedByMe: false,
  };
}

/**
 * @param {{
 *   viewerId: string;
 *   blockedId: string;
 *   asUserId?: unknown;
 * }} args
 */
export async function unblockUserForViewer({ viewerId, blockedId, asUserId }) {
  const viewer = await UserModel.findById(viewerId).select("userRole").lean();
  const isModerator = viewer?.userRole === "admin" || viewer?.userRole === "moderator";

  const asUser =
    asUserId != null && String(asUserId).trim() !== "" ? String(asUserId).trim() : "";
  const blockerId = isModerator && asUser ? asUser : viewerId;

  if (blockerId !== viewerId && !isModerator) {
    throw new AppError(403, "Недостаточно прав");
  }

  return unblockUser(blockerId, blockedId);
}

/**
 * @param {{
 *   blockerId: string;
 *   page?: number;
 *   limit?: number;
 * }} params
 */
export async function listUsersBlockedBy({
  blockerId,
  page = 1,
  limit = USER_BLOCK_LIST_MAX_LIMIT,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(
    USER_BLOCK_LIST_MAX_LIMIT,
    Math.max(1, Number(limit) || USER_BLOCK_LIST_MAX_LIMIT),
  );
  const skip = (safePage - 1) * safeLimit;

  const [rows, total] = await Promise.all([
    UserBlockModel.find({ blockerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("blockedId", USER_LIST_SELECT)
      .lean(),
    UserBlockModel.countDocuments({ blockerId }),
  ]);

  const users = rows
    .map((row) => row.blockedId)
    .filter(Boolean)
    .map((user) => ({
      ...user,
      _id: String(user._id),
      blockedAt: rows.find((row) => String(row.blockedId?._id) === String(user._id))
        ?.createdAt,
    }));

  return {
    users,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 0,
    },
  };
}

/**
 * @param {Record<string, unknown>} user
 * @param {{ viewerId?: string | null }} ctx
 */
export async function attachBlockFieldsToPublicProfile(user, ctx) {
  const userId = String(user._id ?? "");
  const viewerId = ctx.viewerId ? String(ctx.viewerId) : "";

  if (!viewerId || viewerId === userId) {
    return user;
  }

  const [blockedByMe, blockedByViewer] = await Promise.all([
    isUserBlockedBy(viewerId, userId),
    isUserBlockedBy(userId, viewerId),
  ]);

  return {
    ...user,
    isBlockedByMe: blockedByMe,
    isBlockedByViewer: blockedByViewer,
  };
}
