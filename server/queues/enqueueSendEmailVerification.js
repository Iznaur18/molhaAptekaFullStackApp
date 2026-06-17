import { sendEmailVerificationForUser } from "../services/auth/emailVerification.js";

import { getAppQueue } from "./appQueue.js";
import { JOB_SEND_EMAIL_VERIFICATION } from "./queueConstants.js";

const EMAIL_VERIFICATION_JOB_ATTEMPTS = 3;
const EMAIL_VERIFICATION_BACKOFF_MS = 5000;

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @returns {Promise<{ queued: boolean }>}
 */
export async function enqueueSendEmailVerification(userId) {
  const queue = getAppQueue();
  const normalizedUserId = String(userId);

  if (queue) {
    await queue.add(
      JOB_SEND_EMAIL_VERIFICATION,
      { userId: normalizedUserId },
      {
        attempts: EMAIL_VERIFICATION_JOB_ATTEMPTS,
        backoff: {
          type: "exponential",
          delay: EMAIL_VERIFICATION_BACKOFF_MS,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );
    return { queued: true };
  }

  await sendEmailVerificationForUser(userId);
  return { queued: false };
}
