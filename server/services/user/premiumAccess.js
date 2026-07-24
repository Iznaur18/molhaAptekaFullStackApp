import { UserModel } from "../../models/index.js";
import {
  IN_APP_NOTIFICATION_KIND_PREMIUM_EXPIRED,
  IN_APP_NOTIFICATION_KIND_PREMIUM_EXPIRING_SOON,
  IN_APP_NOTIFICATION_KIND_PREMIUM_REVOKED_BY_STAFF,
  IN_APP_NOTIFICATION_MESSAGE_PREMIUM_EXPIRED,
  IN_APP_NOTIFICATION_MESSAGE_PREMIUM_EXPIRING_SOON,
  IN_APP_NOTIFICATION_MESSAGE_PREMIUM_REVOKED_BY_STAFF,
  PREMIUM_DURATION_CALENDAR_MONTHS,
  PREMIUM_EXPIRY_REMINDER_DAYS,
  PREMIUM_PRICE_POINTS,
} from "../../constants/premiumConstants.js";
import { REFERRAL_SOURCE_KIND_PREMIUM } from "../../constants/referralConstants.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
import {
  deductLoyaltyPoints,
  InsufficientLoyaltyPointsError,
} from "../loyalty/loyaltyPointsSpend.js";
import {
  creditReferralCashbackFromSpend,
  notifyReferralCashbackCredited,
} from "../referral/creditReferralCashbackFromSpend.js";
import { backgroundValueAfterPremiumChange } from "./userBackgroundValue.js";
import { createUserInAppNotification } from "./userInAppNotifications.js";

export class PremiumAlreadyActiveError extends Error {
  constructor() {
    super("Премиум уже активен");
    this.name = "PremiumAlreadyActiveError";
  }
}

/**
 * @param {Date | string | null | undefined} value
 */
export const addCalendarMonth = (value) => {
  const date = new Date(value ?? Date.now());
  const next = new Date(date);
  next.setMonth(next.getMonth() + PREMIUM_DURATION_CALENDAR_MONTHS);
  return next;
};

/**
 * @param {{ isPremiumUser?: boolean; premiumExpiresAt?: Date | string | null }} | null | undefined} user
 */
export const isPremiumActive = (user) => {
  if (!user || user.isPremiumUser !== true) {
    return false;
  }
  const expiresAt = user.premiumExpiresAt;
  if (!expiresAt) {
    return true;
  }
  return new Date(expiresAt).getTime() > Date.now();
};

/**
 * @param {import('mongoose').Document | Record<string, unknown>} user
 */
export const deactivatePremiumUserRecord = async (user) => {
  const wasPremium = Boolean(user.isPremiumUser);
  if (!wasPremium) {
    return false;
  }

  user.isPremiumUser = false;
  user.premiumExpiresAt = null;
  user.premiumExpiryReminderSentAt = null;
  user.userBackgroundUrl = backgroundValueAfterPremiumChange(
    true,
    false,
    user.userBackgroundUrl,
  );
  await user.save();
  return true;
};

/**
 * @param {string} userId
 */
export const syncPremiumExpiryForUser = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.isPremiumUser) {
    return false;
  }
  if (isPremiumActive(user)) {
    return false;
  }
  const changed = await deactivatePremiumUserRecord(user);
  if (changed) {
    await createUserInAppNotification({
      userId,
      kind: IN_APP_NOTIFICATION_KIND_PREMIUM_EXPIRED,
      message: IN_APP_NOTIFICATION_MESSAGE_PREMIUM_EXPIRED,
    });
  }
  return changed;
};

export const expirePremiumUsersAndNotify = async () => {
  const now = new Date();
  const rows = await UserModel.find({
    isPremiumUser: true,
    premiumExpiresAt: { $lte: now },
  })
    .select("_id")
    .lean();

  await Promise.all(rows.map((row) => syncPremiumExpiryForUser(String(row._id))));
};

export const sendPremiumExpiryReminders = async () => {
  const now = new Date();
  const reminderUntil = new Date(
    now.getTime() + PREMIUM_EXPIRY_REMINDER_DAYS * 24 * 60 * 60 * 1000,
  );

  const rows = await UserModel.find({
    isPremiumUser: true,
    premiumExpiresAt: { $gt: now, $lte: reminderUntil },
    premiumExpiryReminderSentAt: null,
  })
    .select("_id premiumExpiresAt")
    .lean();

  if (rows.length === 0) {
    return;
  }

  const rowIds = rows.map((row) => row._id);
  await UserModel.updateMany(
    { _id: { $in: rowIds }, premiumExpiryReminderSentAt: null },
    { $set: { premiumExpiryReminderSentAt: now } },
  );

  await Promise.all(
    rows.map((row) =>
      createUserInAppNotification({
        userId: row._id,
        kind: IN_APP_NOTIFICATION_KIND_PREMIUM_EXPIRING_SOON,
        message: IN_APP_NOTIFICATION_MESSAGE_PREMIUM_EXPIRING_SOON,
      }),
    ),
  );
};

export const processPremiumCronTasks = async () => {
  await expirePremiumUsersAndNotify();
  await sendPremiumExpiryReminders();
};

/**
 * @param {string} userId
 */
export const purchasePremiumSubscription = async (userId) => {
  const user = await UserModel.findById(userId)
    .select("isPremiumUser premiumExpiresAt isBlockedUser isActiveUser")
    .lean();

  if (!user || user.isActiveUser === false) {
    throw new Error("USER_NOT_FOUND");
  }
  if (user.isBlockedUser === true) {
    throw new Error("USER_BLOCKED");
  }
  if (isPremiumActive(user)) {
    throw new PremiumAlreadyActiveError();
  }

  return runInTransaction(async (session) => {
    const loyaltyPointsBalance = await deductLoyaltyPoints({
      userId,
      amount: PREMIUM_PRICE_POINTS,
      session,
    });

    const premiumExpiresAt = addCalendarMonth(new Date());
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          isPremiumUser: true,
          premiumExpiresAt,
          premiumExpiryReminderSentAt: null,
        },
      },
      { session },
    );

    const cashback = await creditReferralCashbackFromSpend({
      spenderUserId: userId,
      pointsSpent: PREMIUM_PRICE_POINTS,
      sourceKind: REFERRAL_SOURCE_KIND_PREMIUM,
      sourceId: `premium:${userId}:${premiumExpiresAt.toISOString()}`,
      session,
    });

    return { loyaltyPointsBalance, premiumExpiresAt, cashback };
  }).then(async (result) => {
    if (result.cashback?.deferNotification) {
      await notifyReferralCashbackCredited({
        referrerUserId: result.cashback.referrerUserId,
        amount: result.cashback.amount,
        spenderUserId: userId,
      });
    }
    return {
      loyaltyPointsBalance: result.loyaltyPointsBalance,
      premiumExpiresAt: result.premiumExpiresAt,
    };
  });
};

/**
 * @param {Date | string | null | undefined} premiumExpiresAt
 */
export const resolvePremiumFlagsFromExpiry = (premiumExpiresAt) => {
  if (premiumExpiresAt == null || premiumExpiresAt === "") {
    return { isPremiumUser: false, premiumExpiresAt: null };
  }
  const expiresAt = new Date(premiumExpiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    throw new Error("Некорректная дата окончания премиума");
  }
  return {
    isPremiumUser: expiresAt.getTime() > Date.now(),
    premiumExpiresAt: expiresAt,
  };
};

/**
 * @param {{
 *   wasPremium: boolean;
 *   nextPremium: boolean;
 *   currentBackground?: string;
 *   updateData: Record<string, unknown>;
 * }} params
 */
/**
 * @param {string} userId
 */
export const notifyPremiumRevokedByStaff = async (userId) => {
  await createUserInAppNotification({
    userId,
    kind: IN_APP_NOTIFICATION_KIND_PREMIUM_REVOKED_BY_STAFF,
    message: IN_APP_NOTIFICATION_MESSAGE_PREMIUM_REVOKED_BY_STAFF,
  });
};

export const applyPremiumExpiryAdminUpdate = ({
  wasPremium,
  nextPremium,
  currentBackground,
  updateData,
}) => {
  if (wasPremium && !nextPremium) {
    updateData.userBackgroundUrl = backgroundValueAfterPremiumChange(
      wasPremium,
      nextPremium,
      currentBackground,
    );
    updateData.premiumExpiryReminderSentAt = null;
  }
  if (nextPremium && !wasPremium) {
    updateData.premiumExpiryReminderSentAt = null;
  }
};
