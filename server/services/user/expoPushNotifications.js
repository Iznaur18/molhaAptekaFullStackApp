import { Expo } from "expo-server-sdk";

import {
  EXPO_PUSH_TOKEN_PREFIXES,
  EXPO_PUSH_TOKENS_MAX_PER_USER,
} from "../../constants/expoPushConstants.js";
import { UserModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/** @type {Expo | null} */
let expoClient = null;

const getExpoClient = () => {
  if (!expoClient) {
    expoClient = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN?.trim() || undefined,
    });
  }
  return expoClient;
};

/**
 * @param {string} token
 */
export function isValidExpoPushToken(token) {
  const value = String(token ?? "").trim();
  if (!value) {
    return false;
  }
  if (!Expo.isExpoPushToken(value)) {
    return EXPO_PUSH_TOKEN_PREFIXES.some((prefix) => value.startsWith(prefix));
  }
  return true;
}

/**
 * @param {string} userId
 * @param {string} token
 * @param {string | undefined} platform
 */
export async function registerExpoPushTokenForUser(userId, token, platform) {
  const normalizedToken = String(token).trim();
  if (!isValidExpoPushToken(normalizedToken)) {
    throw new Error("Невалидный Expo push token");
  }

  const user = await UserModel.findById(userId).select("expoPushTokens");
  if (!user) {
    throw new Error("Пользователь не найден");
  }

  const now = new Date();
  const existing = Array.isArray(user.expoPushTokens) ? [...user.expoPushTokens] : [];
  const withoutDuplicate = existing.filter((row) => row.token !== normalizedToken);
  const nextRow = {
    token: normalizedToken,
    platform: platform ?? "unknown",
    updatedAt: now,
  };
  const nextTokens = [nextRow, ...withoutDuplicate].slice(
    0,
    EXPO_PUSH_TOKENS_MAX_PER_USER,
  );

  user.expoPushTokens = nextTokens;
  await user.save({ validateBeforeSave: false });
}

/**
 * @param {string} userId
 * @param {string} token
 */
export async function removeExpoPushTokenForUser(userId, token) {
  const normalizedToken = String(token).trim();
  if (!normalizedToken) {
    return;
  }

  await UserModel.updateOne(
    { _id: userId },
    { $pull: { expoPushTokens: { token: normalizedToken } } },
  );
}

/**
 * @param {{
 *   kind: string;
 *   message: string;
 *   productId?: string | null;
 *   actorUserId?: string | null;
 *   notificationId?: string | null;
 * }} params
 */
export function buildExpoPushDataPayload(params) {
  const data = { kind: params.kind };
  if (params.productId) {
    data.productId = String(params.productId);
  }
  if (params.actorUserId) {
    data.actorUserId = String(params.actorUserId);
  }
  if (params.notificationId) {
    data.notificationId = String(params.notificationId);
  }
  return data;
}

/**
 * @param {string} userId
 * @param {{ title?: string; body: string; data?: Record<string, string> }} message
 */
export async function sendExpoPushToUser(userId, message) {
  const user = await UserModel.findById(userId)
    .select("expoPushTokens notificationsEnabled isBlockedUser isActiveUser")
    .lean();

  if (!user || user.isBlockedUser || user.isActiveUser === false) {
    return;
  }
  if (user.notificationsEnabled === false) {
    return;
  }

  const tokens = (user.expoPushTokens ?? [])
    .map((row) => String(row.token ?? "").trim())
    .filter(isValidExpoPushToken);

  if (tokens.length === 0) {
    return;
  }

  const expo = getExpoClient();
  const chunks = expo.chunkPushNotifications(
    tokens.map((to) => ({
      to,
      sound: "default",
      title: message.title ?? "Gitorg",
      body: message.body,
      data: message.data ?? {},
    })),
  );

  const invalidTokens = [];

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((ticket, index) => {
        if (ticket.status === "error") {
          const detail = ticket.details?.error;
          if (detail === "DeviceNotRegistered") {
            invalidTokens.push(chunk[index]?.to);
          }
        }
      });
    } catch (error) {
      logServerEvent("error", {
        event: "sendexpopushtouser_chunk",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (invalidTokens.length > 0) {
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { expoPushTokens: { token: { $in: invalidTokens.filter(Boolean) } } } },
    );
  }
}
