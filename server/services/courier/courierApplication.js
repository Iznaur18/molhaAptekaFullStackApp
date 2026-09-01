import {
  COURIER_ADDRESS_REQUIRED_MESSAGE,
  COURIER_ALREADY_PENDING_MESSAGE,
  COURIER_MODERATION_APPROVED,
  COURIER_MODERATION_MESSAGES,
  COURIER_MODERATION_NONE,
  COURIER_MODERATION_PENDING,
  COURIER_MODERATION_REJECTED,
  IN_APP_NOTIFICATION_KIND_COURIER_MODERATION,
} from "../../constants/courierConstants.js";
import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

/** Поля профиля курьера, безопасные для самого курьера и для стаффа. */
const COURIER_PROFILE_FIELDS =
  "courierProfile userName userPhoneNumber userAddress userAddressCity userRegionCode";

/**
 * @param {{ courierProfile?: Record<string, any> } | null} user
 */
export const projectCourierProfile = (user) => {
  const profile = user?.courierProfile ?? {};
  return {
    moderationStatus: profile.moderationStatus ?? COURIER_MODERATION_NONE,
    vehicleMake: profile.vehicleMake ?? "",
    vehicleColor: profile.vehicleColor ?? "",
    vehiclePlate: profile.vehiclePlate ?? "",
    vehiclePhotoFrontUrl: profile.vehiclePhotoFrontUrl ?? "",
    vehiclePhotoRearUrl: profile.vehiclePhotoRearUrl ?? "",
    driverLicensePhotoUrl: profile.driverLicensePhotoUrl ?? "",
    vehicleRegistrationPhotoUrl: profile.vehicleRegistrationPhotoUrl ?? "",
    moderationComment: profile.moderationComment ?? "",
    submittedAt: profile.submittedAt ?? null,
    reviewedAt: profile.reviewedAt ?? null,
    declinedJobCount: profile.declinedJobCount ?? 0,
    isApproved: profile.moderationStatus === COURIER_MODERATION_APPROVED,
  };
};

/**
 * @param {string} userId
 */
export async function getMyCourierProfile(userId) {
  const user = await UserModel.findById(userId).select(COURIER_PROFILE_FIELDS).lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }
  return {
    ...projectCourierProfile(user),
    regionCode: user.userRegionCode ?? "",
    addressCity: user.userAddressCity ?? "",
    hasAddress: Boolean(String(user.userAddress ?? "").trim()),
  };
}

/**
 * Подать заявку курьера (или переподать после отказа).
 *
 * Адрес обязателен: регион курьера берётся из профиля, а без региона он не
 * увидит в «Обзоре» ни одного заказа — заявка была бы бессмысленной.
 *
 * @param {{
 *   userId: string;
 *   vehicleMake: string;
 *   vehicleColor: string;
 *   vehiclePlate: string;
 * }} input
 */
export async function submitCourierApplication({
  userId,
  vehicleMake,
  vehicleColor,
  vehiclePlate,
  vehiclePhotoFrontUrl,
  vehiclePhotoRearUrl,
  driverLicensePhotoUrl,
  vehicleRegistrationPhotoUrl,
}) {
  const user = await UserModel.findById(userId).select(
    "courierProfile userAddress userRegionCode",
  );
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  if (!String(user.userAddress ?? "").trim() || !String(user.userRegionCode ?? "").trim()) {
    throw new AppError(400, COURIER_ADDRESS_REQUIRED_MESSAGE);
  }

  const status = user.courierProfile?.moderationStatus ?? COURIER_MODERATION_NONE;
  if (status === COURIER_MODERATION_PENDING) {
    throw new AppError(409, COURIER_ALREADY_PENDING_MESSAGE);
  }

  user.courierProfile = {
    ...(user.courierProfile?.toObject?.() ?? user.courierProfile ?? {}),
    moderationStatus: COURIER_MODERATION_PENDING,
    vehicleMake,
    vehicleColor,
    vehiclePlate,
    vehiclePhotoFrontUrl,
    vehiclePhotoRearUrl,
    driverLicensePhotoUrl,
    vehicleRegistrationPhotoUrl,
    submittedAt: new Date(),
    // Переподача после отказа: старое решение больше не актуально.
    reviewedAt: null,
    reviewedBy: null,
    moderationComment: "",
  };
  await user.save({ validateBeforeSave: true });

  logServerEvent("info", {
    event: "courier.application_submitted",
    userId: String(userId),
    resubmit: status === COURIER_MODERATION_REJECTED,
  });

  return projectCourierProfile(user);
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
export async function reviewCourierApplication({
  userId,
  moderatorId,
  nextStatus,
  comment = "",
}) {
  if (
    nextStatus !== COURIER_MODERATION_APPROVED &&
    nextStatus !== COURIER_MODERATION_REJECTED
  ) {
    throw new AppError(400, "Заявку можно только одобрить или отклонить");
  }

  const user = await UserModel.findById(userId).select("courierProfile");
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const status = user.courierProfile?.moderationStatus ?? COURIER_MODERATION_NONE;
  if (status === COURIER_MODERATION_NONE) {
    throw new AppError(409, "Пользователь не подавал заявку курьера");
  }

  user.courierProfile.moderationStatus = nextStatus;
  user.courierProfile.reviewedAt = new Date();
  user.courierProfile.reviewedBy = moderatorId;
  user.courierProfile.moderationComment =
    nextStatus === COURIER_MODERATION_REJECTED ? comment : "";
  await user.save({ validateBeforeSave: true });

  logServerEvent("info", {
    event: "courier.application_reviewed",
    userId: String(userId),
    moderatorId: String(moderatorId),
    nextStatus,
  });

  // Уведомление вне транзакции: упавший пуш не должен откатывать решение.
  try {
    await createUserInAppNotification({
      userId: String(userId),
      kind: IN_APP_NOTIFICATION_KIND_COURIER_MODERATION,
      message: COURIER_MODERATION_MESSAGES[nextStatus],
      actorUserId: String(moderatorId),
    });
  } catch (error) {
    logServerEvent("error", {
      event: "courier.review_notify_failed",
      userId: String(userId),
      ...formatLogError(error),
    });
  }

  return projectCourierProfile(user);
}

/**
 * Очередь модерации для стаффа.
 *
 * @param {{ status: string; page?: number; limit?: number }} input
 */
export async function listCourierApplications({ status, page = 1, limit = 20 }) {
  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 20)));

  const filter = { "courierProfile.moderationStatus": status };
  const [rows, total] = await Promise.all([
    UserModel.find(filter)
      .select(COURIER_PROFILE_FIELDS)
      .sort({ "courierProfile.submittedAt": -1 })
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
      userPhoneNumber: row.userPhoneNumber ?? "",
      addressCity: row.userAddressCity ?? "",
      regionCode: row.userRegionCode ?? "",
      ...projectCourierProfile(row),
    })),
  };
}
