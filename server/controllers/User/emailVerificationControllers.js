import {
  EMAIL_VERIFICATION_INVALID_CODE_MESSAGE,
  EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE,
  EMAIL_VERIFICATION_SENT_MESSAGE,
  EMAIL_VERIFICATION_SUCCESS_MESSAGE,
} from "../../constants/emailVerificationConstants.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { enqueueSendEmailVerification } from "../../queues/enqueueSendEmailVerification.js";
import {
  verifyEmailByCodeForUser,
  verifyEmailByToken,
} from "../../services/auth/emailVerification.js";
import { resolveFrontendOrigin } from "../../utils/resolveFrontendOrigin.js";

/** `GET /auth/verify-email?token=...` — подтверждение email по ссылке. */
export const verifyEmailController = async (req, res) => {
  const token = req.query?.token;
  const frontendUrl = resolveFrontendOrigin();

  try {
    await verifyEmailByToken(token);
  } catch (verificationError) {
    const message =
      verificationError instanceof Error
        ? verificationError.message
        : EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE;
    return res.redirect(
      `${frontendUrl}/?emailVerified=error&message=${encodeURIComponent(message)}`,
    );
  }

  return res.redirect(
    `${frontendUrl}/?emailVerified=1&message=${encodeURIComponent(EMAIL_VERIFICATION_SUCCESS_MESSAGE)}`,
  );
};

/** `POST /auth/resend-verification` — повторная отправка (auth). */
export const resendEmailVerificationController = async (req, res) => {
  const userId = req.userId;

  try {
    await enqueueSendEmailVerification(userId);
  } catch (sendError) {
    const message =
      sendError instanceof Error ? sendError.message : "Не удалось отправить письмо";
    return errorRes(res, 400, message);
  }

  return successRes(res, { message: EMAIL_VERIFICATION_SENT_MESSAGE });
};

/** `POST /auth/verify-email` — подтверждение email кодом из письма (auth). */
export const verifyEmailWithCodeController = async (req, res) => {
  const userId = req.userId;
  const code = req.body?.code;

  try {
    await verifyEmailByCodeForUser(userId, code);
  } catch (verificationError) {
    return errorRes(
      res,
      400,
      verificationError instanceof Error
        ? verificationError.message
        : EMAIL_VERIFICATION_INVALID_CODE_MESSAGE,
    );
  }

  return successRes(res, { message: EMAIL_VERIFICATION_SUCCESS_MESSAGE });
};
