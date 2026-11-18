import {
  EMAIL_VERIFICATION_INVALID_CODE_MESSAGE,
  EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE,
  EMAIL_VERIFICATION_SENT_MESSAGE,
  EMAIL_VERIFICATION_SUCCESS_MESSAGE,
} from "../../constants/emailVerificationConstants.js";
import { successRes } from "../../services/http/index.js";
import { enqueueSendEmailVerification } from "../../queues/enqueueSendEmailVerification.js";
import { throwMappedAuthChannelError } from "../../services/auth/mapAuthChannelError.js";
import {
  confirmEmailBindForUser,
  requestEmailBindForUser,
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
  try {
    await enqueueSendEmailVerification(req.userId);
  } catch (sendError) {
    throwMappedAuthChannelError(sendError, {
      fallbackMessage: "Не удалось отправить письмо",
    });
  }

  return successRes(res, { message: EMAIL_VERIFICATION_SENT_MESSAGE });
};

/** `POST /auth/verify-email` — подтверждение email кодом из письма (auth). */
export const verifyEmailWithCodeController = async (req, res) => {
  try {
    await verifyEmailByCodeForUser(req.userId, req.body?.code);
  } catch (verificationError) {
    throwMappedAuthChannelError(verificationError, {
      fallbackMessage: EMAIL_VERIFICATION_INVALID_CODE_MESSAGE,
    });
  }

  return successRes(res, { message: EMAIL_VERIFICATION_SUCCESS_MESSAGE });
};

/** `POST /auth/email/bind/request` (auth) */
export const emailBindRequestController = async (req, res) => {
  let result;
  try {
    result = await requestEmailBindForUser(req.userId, req.body.email);
  } catch (error) {
    throwMappedAuthChannelError(error, {
      fallbackMessage: "Не удалось отправить письмо",
    });
  }

  return successRes(res, {
    email: result.email,
    message: EMAIL_VERIFICATION_SENT_MESSAGE,
  });
};

/** `POST /auth/email/bind/confirm` (auth) */
export const emailBindConfirmController = async (req, res) => {
  let result;
  try {
    result = await confirmEmailBindForUser(req.userId, req.body.code);
  } catch (error) {
    throwMappedAuthChannelError(error, {
      fallbackMessage: EMAIL_VERIFICATION_INVALID_CODE_MESSAGE,
    });
  }

  return successRes(res, {
    email: result.email,
    message: EMAIL_VERIFICATION_SUCCESS_MESSAGE,
  });
};
