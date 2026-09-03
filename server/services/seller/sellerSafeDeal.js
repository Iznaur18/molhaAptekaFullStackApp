import {
  isInnLengthValidForLegalForm,
  isValidInn,
  SAFE_DEAL_INN_INVALID_MESSAGE,
} from "@molha/api-contract";

import {
  IN_APP_NOTIFICATION_KIND_SAFE_DEAL_MODERATION,
  SAFE_DEAL_ALREADY_PENDING_MESSAGE,
  SAFE_DEAL_INN_TAKEN_MESSAGE,
  SAFE_DEAL_MODERATION_APPROVED,
  SAFE_DEAL_MODERATION_MESSAGES,
  SAFE_DEAL_MODERATION_NONE,
  SAFE_DEAL_MODERATION_PENDING,
  SAFE_DEAL_MODERATION_REJECTED,
  SAFE_DEAL_NO_APPLICATION_MESSAGE,
  SELLER_LEGAL_FORM_NONE,
} from "../../constants/safeDealConstants.js";
import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

/** Поля, безопасные для самого продавца и для стаффа. */
const SAFE_DEAL_PROFILE_FIELDS =
  "sellerSafeDeal userName userFullName userPhoneNumber userAddressCity userRegionCode";

/**
 * @param {{ sellerSafeDeal?: Record<string, any> } | null} user
 */
export const projectSellerSafeDeal = (user) => {
  const safeDeal = user?.sellerSafeDeal ?? {};
  const moderationStatus = safeDeal.moderationStatus ?? SAFE_DEAL_MODERATION_NONE;
  return {
    moderationStatus,
    legalForm: safeDeal.legalForm ?? SELLER_LEGAL_FORM_NONE,
    inn: safeDeal.inn ?? "",
    moderationComment: safeDeal.moderationComment ?? "",
    submittedAt: safeDeal.submittedAt ?? null,
    reviewedAt: safeDeal.reviewedAt ?? null,
    isApproved: moderationStatus === SAFE_DEAL_MODERATION_APPROVED,
  };
};

/**
 * @param {string} userId
 */
export async function getMySellerSafeDeal(userId) {
  const user = await UserModel.findById(userId).select(SAFE_DEAL_PROFILE_FIELDS).lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }
  return projectSellerSafeDeal(user);
}

/**
 * Не занят ли ИНН уже подтверждённым продавцом.
 *
 * Проверяем до записи, чтобы продавец увидел понятный текст, а не E11000 от
 * уникального индекса. Сам индекс при этом остаётся — он ловит гонку.
 *
 * @param {{ inn: string; exceptUserId: string }} input
 */
async function assertInnNotTakenByApprovedSeller({ inn, exceptUserId }) {
  const owner = await UserModel.findOne({
    _id: { $ne: exceptUserId },
    "sellerSafeDeal.inn": inn,
    "sellerSafeDeal.moderationStatus": SAFE_DEAL_MODERATION_APPROVED,
  })
    .select("_id")
    .lean();

  if (owner) {
    throw new AppError(409, SAFE_DEAL_INN_TAKEN_MESSAGE);
  }
}

/**
 * Подать заявку на безопасную сделку (или переподать после отказа).
 *
 * Одобренную заявку не переподают: смена ИНН у подтверждённого продавца —
 * это смена получателя денег, и решать её должен модератор, а не форма.
 *
 * @param {{ userId: string; legalForm: string; inn: string }} input
 */
export async function submitSellerSafeDealApplication({ userId, legalForm, inn }) {
  const normalizedInn = String(inn ?? "").trim();

  // Схема тела уже это проверила; здесь — защита от вызова мимо валидации.
  if (
    !isInnLengthValidForLegalForm(legalForm, normalizedInn) ||
    !isValidInn(normalizedInn)
  ) {
    throw new AppError(400, SAFE_DEAL_INN_INVALID_MESSAGE);
  }

  const user = await UserModel.findById(userId).select("sellerSafeDeal");
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const status = user.sellerSafeDeal?.moderationStatus ?? SAFE_DEAL_MODERATION_NONE;
  if (status === SAFE_DEAL_MODERATION_PENDING) {
    throw new AppError(409, SAFE_DEAL_ALREADY_PENDING_MESSAGE);
  }
  if (status === SAFE_DEAL_MODERATION_APPROVED) {
    throw new AppError(
      409,
      "Безопасная сделка уже подключена — для смены реквизитов напишите в поддержку",
    );
  }

  await assertInnNotTakenByApprovedSeller({ inn: normalizedInn, exceptUserId: userId });

  user.sellerSafeDeal = {
    ...(user.sellerSafeDeal?.toObject?.() ?? user.sellerSafeDeal ?? {}),
    moderationStatus: SAFE_DEAL_MODERATION_PENDING,
    legalForm,
    inn: normalizedInn,
    submittedAt: new Date(),
    // Переподача после отказа: старое решение больше не актуально.
    reviewedAt: null,
    reviewedBy: null,
    moderationComment: "",
  };
  await user.save({ validateBeforeSave: true });

  logServerEvent("info", {
    event: "safe_deal.application_submitted",
    userId: String(userId),
    legalForm,
    resubmit: status === SAFE_DEAL_MODERATION_REJECTED,
  });

  return projectSellerSafeDeal(user);
}

/**
 * Решение модератора по заявке.
 *
 * @param {{
 *   userId: string;
 *   moderatorId: string;
 *   nextStatus: "approved" | "rejected";
 *   comment?: string;
 * }} input
 */
export async function reviewSellerSafeDealApplication({
  userId,
  moderatorId,
  nextStatus,
  comment = "",
}) {
  if (
    nextStatus !== SAFE_DEAL_MODERATION_APPROVED &&
    nextStatus !== SAFE_DEAL_MODERATION_REJECTED
  ) {
    throw new AppError(400, "Заявку можно только одобрить или отклонить");
  }

  const user = await UserModel.findById(userId).select("sellerSafeDeal");
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const status = user.sellerSafeDeal?.moderationStatus ?? SAFE_DEAL_MODERATION_NONE;
  if (status === SAFE_DEAL_MODERATION_NONE) {
    throw new AppError(409, SAFE_DEAL_NO_APPLICATION_MESSAGE);
  }

  if (nextStatus === SAFE_DEAL_MODERATION_APPROVED) {
    await assertInnNotTakenByApprovedSeller({
      inn: String(user.sellerSafeDeal?.inn ?? "").trim(),
      exceptUserId: userId,
    });
  }

  user.sellerSafeDeal.moderationStatus = nextStatus;
  user.sellerSafeDeal.reviewedAt = new Date();
  user.sellerSafeDeal.reviewedBy = moderatorId;
  user.sellerSafeDeal.moderationComment =
    nextStatus === SAFE_DEAL_MODERATION_REJECTED ? comment : "";
  await user.save({ validateBeforeSave: true });

  logServerEvent("info", {
    event: "safe_deal.application_reviewed",
    userId: String(userId),
    moderatorId: String(moderatorId),
    nextStatus,
  });

  // Уведомление вне транзакции: упавший пуш не должен откатывать решение.
  try {
    await createUserInAppNotification({
      userId: String(userId),
      kind: IN_APP_NOTIFICATION_KIND_SAFE_DEAL_MODERATION,
      message: SAFE_DEAL_MODERATION_MESSAGES[nextStatus],
      actorUserId: String(moderatorId),
    });
  } catch (error) {
    logServerEvent("error", {
      event: "safe_deal.review_notify_failed",
      userId: String(userId),
      ...formatLogError(error),
    });
  }

  return projectSellerSafeDeal(user);
}

/**
 * Очередь модерации для стаффа.
 *
 * @param {{ status: string; page?: number; limit?: number }} input
 */
export async function listSellerSafeDealApplications({ status, page = 1, limit = 20 }) {
  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 20)));

  const filter = { "sellerSafeDeal.moderationStatus": status };
  const [rows, total] = await Promise.all([
    UserModel.find(filter)
      .select(SAFE_DEAL_PROFILE_FIELDS)
      .sort({ "sellerSafeDeal.submittedAt": -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  return {
    total,
    page: safePage,
    limit: safeLimit,
    applications: rows.map((row) => ({
      userId: String(row._id),
      userName: row.userName ?? "",
      userFullName: row.userFullName ?? "",
      userPhoneNumber: row.userPhoneNumber ?? "",
      addressCity: row.userAddressCity ?? "",
      regionCode: row.userRegionCode ?? "",
      ...projectSellerSafeDeal(row),
    })),
  };
}
