import {
  IN_APP_NOTIFICATION_KIND_DATA_CONFIRMATION_APPROVED,
  IN_APP_NOTIFICATION_KIND_DATA_CONFIRMATION_REJECTED,
  IN_APP_NOTIFICATION_MESSAGE_DATA_CONFIRMATION_APPROVED,
  IN_APP_NOTIFICATION_MESSAGE_DATA_CONFIRMATION_REJECTED,
  USER_DATA_CONFIRMATION_ALREADY_CONFIRMED_MESSAGE,
  USER_DATA_CONFIRMATION_ALREADY_PENDING_MESSAGE,
  USER_DATA_CONFIRMATION_AUTO_REJECT_STAFF_NOTE,
  USER_DATA_CONFIRMATION_RESOLUTION_APPROVE,
  USER_DATA_CONFIRMATION_RESOLUTION_REJECT,
  USER_DATA_CONFIRMATION_STAFF_NOTE_MIN_WORDS,
  USER_DATA_CONFIRMATION_STATUS_APPROVED,
  USER_DATA_CONFIRMATION_STATUS_PENDING,
  USER_DATA_CONFIRMATION_STATUS_REJECTED,
} from "../../constants/userDataConfirmationConstants.js";
import { AppError } from "../../errors/AppError.js";
import { UserDataConfirmationRequestModel, UserModel } from "../../models/index.js";
import { PRIVATE_UPLOAD_API_PATH_PREFIX } from "../../constants/privateUploadConstants.js";
import { normalizeStoredUploadUrl } from "../upload/buildPublicUploadUrl.js";
import { parsePrivateUploadFilenameFromUrl } from "../upload/privateUploadPaths.js";
import { buildPrivateUploadApiUrl } from "../upload/privateUploadPaths.js";
import { isForeignPrivateUpload } from "../upload/privateUploadOwnership.js";
import {
  openPassportStored,
  recordPassportVaultAccess,
  sealPassportPlain,
} from "../passport-vault/index.js";
import { PASSPORT_VAULT_ACCESS_PURPOSE_STAFF_PENDING } from "../../constants/passportVaultConstants.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
import {
  maskPassportForBuyerApi,
  sanitizeDataConfirmationRequestForBuyer,
} from "./maskPassportForApi.js";
import { createUserInAppNotification } from "./userInAppNotifications.js";
import { assertMinWords } from "./maxWordsText.js";
import { normalizePassportPayload } from "./validatePassportPayload.js";

const UPLOAD_PATH_PREFIX = "/uploads/";

/**
 * @param {unknown} error
 * @param {string} fallback
 */
const throwBadRequest = (error, fallback) => {
  throw new AppError(400, error instanceof Error ? error.message : fallback);
};

/**
 * @param {unknown} value
 */
export const normalizePassportSelfiePhotoUrl = (value) => {
  const raw = String(value ?? "").trim();
  const privateFilename = parsePrivateUploadFilenameFromUrl(raw);
  if (privateFilename) {
    return buildPrivateUploadApiUrl(privateFilename);
  }

  const url = normalizeStoredUploadUrl(raw);
  // Legacy публичные selfie до private-upload — ещё принимаем.
  if (
    url.includes(UPLOAD_PATH_PREFIX) ||
    url.includes(PRIVATE_UPLOAD_API_PATH_PREFIX)
  ) {
    return url;
  }
  throw new AppError(400, "Загрузите фото с паспортом в руках");
};

/**
 * @param {{
 *   userId: string;
 *   passportRaw: unknown;
 *   passportSelfiePhotoUrlRaw: unknown;
 * }} args
 */
export const submitDataConfirmationRequest = async ({
  userId,
  passportRaw,
  passportSelfiePhotoUrlRaw,
}) => {
  const user = await UserModel.findById(userId)
    .select("isUserDataConfirmed isBlockedUser")
    .lean();

  if (!user) {
    throw new AppError(401, "Пользователь не найден");
  }
  if (user.isBlockedUser) {
    throw new AppError(403, "Аккаунт заблокирован");
  }
  if (user.isUserDataConfirmed === true) {
    throw new AppError(400, USER_DATA_CONFIRMATION_ALREADY_CONFIRMED_MESSAGE);
  }

  const existingPending = await UserDataConfirmationRequestModel.findOne({
    userId,
    status: USER_DATA_CONFIRMATION_STATUS_PENDING,
  }).lean();

  if (existingPending) {
    throw new AppError(409, USER_DATA_CONFIRMATION_ALREADY_PENDING_MESSAGE);
  }

  let passport;
  try {
    passport = normalizePassportPayload(passportRaw);
  } catch (validationError) {
    throwBadRequest(validationError, "Некорректные паспортные данные");
  }

  let passportSelfiePhotoUrl;
  try {
    passportSelfiePhotoUrl = normalizePassportSelfiePhotoUrl(passportSelfiePhotoUrlRaw);
  } catch (validationError) {
    if (validationError instanceof AppError) {
      throw validationError;
    }
    throwBadRequest(validationError, "Некорректное фото");
  }

  // Ссылку на приватный файл нельзя принимать на слово: зная имя, заявитель
  // приложил бы к своей анкете чужое селфи с паспортом — и заодно получил бы
  // к нему постоянный доступ как «к своему».
  if (await isForeignPrivateUpload(userId, passportSelfiePhotoUrl)) {
    throw new AppError(403, "Это фото загружали не вы — загрузите своё");
  }

  try {
    await UserDataConfirmationRequestModel.create({
      userId,
      passport: sealPassportPlain(passport),
      passportSelfiePhotoUrl,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(409, USER_DATA_CONFIRMATION_ALREADY_PENDING_MESSAGE);
    }
    throw error;
  }

  return { message: "Заявка принята" };
};

/**
 * @param {{ userId: string }} args
 */
export const getMyDataConfirmationRequest = async ({ userId }) => {
  const user = await UserModel.findById(userId).select("isUserDataConfirmed").lean();

  if (!user) {
    throw new AppError(401, "Пользователь не найден");
  }

  const request = await getLatestDataConfirmationRequestForUser(userId);

  return {
    isUserDataConfirmed: user.isUserDataConfirmed === true,
    request,
  };
};

export const countPendingDataConfirmationRequests = async () => {
  const totalPending = await UserDataConfirmationRequestModel.countDocuments({
    status: USER_DATA_CONFIRMATION_STATUS_PENDING,
  });
  return { totalPending };
};

const PENDING_USER_SELECT = "_id userName userAvatarUrl isPremiumUser createdAt";

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export const rejectPendingDataConfirmationForUser = async (
  userId,
  staffNote = USER_DATA_CONFIRMATION_AUTO_REJECT_STAFF_NOTE,
  reviewedBy = null,
) => {
  const now = new Date();
  const pending = await UserDataConfirmationRequestModel.find({
    userId,
    status: USER_DATA_CONFIRMATION_STATUS_PENDING,
  }).lean();

  if (pending.length === 0) {
    return { rejectedCount: 0 };
  }

  await UserDataConfirmationRequestModel.updateMany(
    { userId, status: USER_DATA_CONFIRMATION_STATUS_PENDING },
    {
      $set: {
        status: USER_DATA_CONFIRMATION_STATUS_REJECTED,
        staffNote,
        reviewedBy,
        reviewedAt: now,
      },
    },
  );

  await createUserInAppNotification({
    userId,
    kind: IN_APP_NOTIFICATION_KIND_DATA_CONFIRMATION_REJECTED,
    message: IN_APP_NOTIFICATION_MESSAGE_DATA_CONFIRMATION_REJECTED,
  });

  return { rejectedCount: pending.length };
};

/**
 * @returns {Promise<{
 *   requests: Array<Record<string, unknown>>;
 *   totalPending: number;
 * }>}
 */
export const getPendingDataConfirmationRequests = async () => {
  const rows = await UserDataConfirmationRequestModel.find({
    status: USER_DATA_CONFIRMATION_STATUS_PENDING,
  })
    .sort({ createdAt: 1 })
    .lean();

  const userIds = [...new Set(rows.map((row) => String(row.userId)))];
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select(PENDING_USER_SELECT)
    .lean();
  const userById = new Map(users.map((u) => [String(u._id), u]));

  const requests = [];
  for (const row of rows) {
    const passportPlain = openPassportStored(row.passport);
    await recordPassportVaultAccess({
      actorUserId: null,
      purpose: PASSPORT_VAULT_ACCESS_PURPOSE_STAFF_PENDING,
      resourceType: "UserDataConfirmationRequest",
      resourceId: String(row._id),
    });
    requests.push({
      ...row,
      _id: String(row._id),
      userId: String(row.userId),
      passport: maskPassportForBuyerApi(passportPlain),
      user: userById.get(String(row.userId)) ?? null,
    });
  }

  return { requests, totalPending: rows.length };
};

/**
 * @param {{
 *   requestId: string;
 *   staffUserId: string;
 *   resolution: string;
 *   staffNote?: string;
 * }} args
 */
export const resolveDataConfirmationRequest = async ({
  requestId,
  staffUserId,
  resolution,
  staffNote = "",
}) => {
  const request = await UserDataConfirmationRequestModel.findById(requestId).lean();

  if (!request) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (request.status !== USER_DATA_CONFIRMATION_STATUS_PENDING) {
    throw new AppError(409, "Заявка уже рассмотрена");
  }

  const now = new Date();
  const applicantId = String(request.userId);

  if (resolution === USER_DATA_CONFIRMATION_RESOLUTION_REJECT) {
    const note = String(staffNote ?? "").trim();
    if (!note) {
      throw new AppError(400, "Укажите комментарий для отклонения");
    }
    try {
      assertMinWords(note, "Комментарий", USER_DATA_CONFIRMATION_STAFF_NOTE_MIN_WORDS);
    } catch (validationError) {
      throwBadRequest(validationError, "Некорректный комментарий");
    }

    await UserDataConfirmationRequestModel.findByIdAndUpdate(requestId, {
      $set: {
        status: USER_DATA_CONFIRMATION_STATUS_REJECTED,
        staffNote: note,
        reviewedBy: staffUserId,
        reviewedAt: now,
      },
    });

    await createUserInAppNotification({
      userId: applicantId,
      kind: IN_APP_NOTIFICATION_KIND_DATA_CONFIRMATION_REJECTED,
      message: IN_APP_NOTIFICATION_MESSAGE_DATA_CONFIRMATION_REJECTED,
    });

    return { requestId, status: USER_DATA_CONFIRMATION_STATUS_REJECTED };
  }

  if (resolution === USER_DATA_CONFIRMATION_RESOLUTION_APPROVE) {
    await runInTransaction(async (session) => {
      await UserDataConfirmationRequestModel.findByIdAndUpdate(
        requestId,
        {
          $set: {
            status: USER_DATA_CONFIRMATION_STATUS_APPROVED,
            staffNote: String(staffNote ?? "").trim(),
            reviewedBy: staffUserId,
            reviewedAt: now,
          },
        },
        { session },
      );

      await UserModel.findByIdAndUpdate(
        applicantId,
        { $set: { isUserDataConfirmed: true } },
        { session },
      );
    });

    await createUserInAppNotification({
      userId: applicantId,
      kind: IN_APP_NOTIFICATION_KIND_DATA_CONFIRMATION_APPROVED,
      message: IN_APP_NOTIFICATION_MESSAGE_DATA_CONFIRMATION_APPROVED,
    });

    return { requestId, status: USER_DATA_CONFIRMATION_STATUS_APPROVED };
  }

  throw new AppError(400, "Некорректное решение");
};

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @returns {Promise<Record<string, unknown> | null>}
 */
export const getLatestDataConfirmationRequestForUser = async (userId) => {
  const row = await UserDataConfirmationRequestModel.findOne({ userId })
    .sort({ createdAt: -1 })
    .lean();

  if (!row) {
    return null;
  }

  const out = sanitizeDataConfirmationRequestForBuyer(row);
  if (row.status !== USER_DATA_CONFIRMATION_STATUS_REJECTED) {
    delete out.staffNote;
  }
  return out;
};
