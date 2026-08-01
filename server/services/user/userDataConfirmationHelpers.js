import {
  IN_APP_NOTIFICATION_KIND_DATA_CONFIRMATION_APPROVED,
  IN_APP_NOTIFICATION_KIND_DATA_CONFIRMATION_REJECTED,
  IN_APP_NOTIFICATION_MESSAGE_DATA_CONFIRMATION_APPROVED,
  IN_APP_NOTIFICATION_MESSAGE_DATA_CONFIRMATION_REJECTED,
  USER_DATA_CONFIRMATION_AUTO_REJECT_STAFF_NOTE,
  USER_DATA_CONFIRMATION_RESOLUTION_APPROVE,
  USER_DATA_CONFIRMATION_RESOLUTION_REJECT,
  USER_DATA_CONFIRMATION_STAFF_NOTE_MIN_WORDS,
  USER_DATA_CONFIRMATION_STATUS_APPROVED,
  USER_DATA_CONFIRMATION_STATUS_PENDING,
  USER_DATA_CONFIRMATION_STATUS_REJECTED,
} from "../../constants/userDataConfirmationConstants.js";
import { UserDataConfirmationRequestModel, UserModel } from "../../models/index.js";
import { PRIVATE_UPLOAD_API_PATH_PREFIX } from "../../constants/privateUploadConstants.js";
import { normalizeStoredUploadUrl } from "../upload/buildPublicUploadUrl.js";
import { parsePrivateUploadFilenameFromUrl } from "../upload/privateUploadPaths.js";
import { buildPrivateUploadApiUrl } from "../upload/privateUploadPaths.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
import {
  maskPassportForBuyerApi,
  sanitizeDataConfirmationRequestForBuyer,
} from "./maskPassportForApi.js";
import { createUserInAppNotification } from "./userInAppNotifications.js";
import { assertMinWords } from "./maxWordsText.js";
import {
  openPassportStored,
  recordPassportVaultAccess,
} from "../passport-vault/index.js";
import { PASSPORT_VAULT_ACCESS_PURPOSE_STAFF_PENDING } from "../../constants/passportVaultConstants.js";

const UPLOAD_PATH_PREFIX = "/uploads/";

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
  throw new Error("Загрузите фото с паспортом в руках");
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
 * @param {import('mongoose').Types.ObjectId | string} requestId
 * @param {import('mongoose').Types.ObjectId | string} staffUserId
 * @param {'approve' | 'reject'} resolution
 * @param {string} staffNote
 */
export const resolveDataConfirmationRequest = async (
  requestId,
  staffUserId,
  resolution,
  staffNote = "",
) => {
  const request = await UserDataConfirmationRequestModel.findById(requestId).lean();

  if (!request) {
    throw new Error("Заявка не найдена");
  }
  if (request.status !== USER_DATA_CONFIRMATION_STATUS_PENDING) {
    throw new Error("Заявка уже рассмотрена");
  }

  const now = new Date();
  const applicantId = String(request.userId);

  if (resolution === USER_DATA_CONFIRMATION_RESOLUTION_REJECT) {
    const note = String(staffNote ?? "").trim();
    if (!note) {
      throw new Error("Укажите комментарий для отклонения");
    }
    assertMinWords(note, "Комментарий", USER_DATA_CONFIRMATION_STAFF_NOTE_MIN_WORDS);

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

  throw new Error("Некорректное решение");
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
