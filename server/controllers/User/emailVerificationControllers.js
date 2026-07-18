import {
  EMAIL_VERIFICATION_INVALID_CODE_MESSAGE,
  EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE,
  EMAIL_VERIFICATION_PENDING_EXPIRED_MESSAGE,
  EMAIL_VERIFICATION_SENT_MESSAGE,
  EMAIL_VERIFICATION_SUCCESS_MESSAGE,
} from "../../constants/emailVerificationConstants.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { sendUserWithToken } from "../../services/auth/sendUserWithToken.js";
import { verifyEmailByToken } from "../../services/auth/emailVerification.js";
import {
  findPendingRegistrationByToken,
  issuePendingEmailVerificationCode,
  promotePendingRegistrationToUser,
  verifyPendingRegistrationCode,
} from "../../services/auth/pendingRegistration.js";

/** `GET /auth/verify-email?token=...` — подтверждение email по ссылке (legacy). */
export const verifyEmailController = async (req, res) => {
  const token = req.query?.token;
  const frontendUrl = (process.env.FRONTEND_URL ?? "http://127.0.0.1:5173").replace(
    /\/$/,
    "",
  );

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

/** `POST /auth/resend-verification` — повторная отправка по pendingToken (без JWT). */
export const resendEmailVerificationController = async (req, res) => {
  const pendingToken = req.body?.pendingToken;

  try {
    const pending = await findPendingRegistrationByToken(pendingToken);
    if (!pending) {
      return errorRes(res, 400, EMAIL_VERIFICATION_PENDING_EXPIRED_MESSAGE);
    }

    await issuePendingEmailVerificationCode(pending);
  } catch (sendError) {
    const message =
      sendError instanceof Error ? sendError.message : "Не удалось отправить письмо";
    return errorRes(res, 400, message);
  }

  return successRes(res, { message: EMAIL_VERIFICATION_SENT_MESSAGE });
};

/**
 * `POST /auth/verify-email` — код + pendingToken → User + JWT.
 * Body: `{ code, pendingToken }`
 */
export const verifyEmailWithCodeController = async (req, res) => {
  const code = req.body?.code;
  const pendingToken = req.body?.pendingToken;

  try {
    const pending = await findPendingRegistrationByToken(pendingToken);
    if (!pending) {
      return errorRes(res, 400, EMAIL_VERIFICATION_PENDING_EXPIRED_MESSAGE);
    }

    await verifyPendingRegistrationCode(pending, code);
    const user = await promotePendingRegistrationToUser(pending);
    user.userLastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return sendUserWithToken(user, res);
  } catch (verificationError) {
    return errorRes(
      res,
      400,
      verificationError instanceof Error
        ? verificationError.message
        : EMAIL_VERIFICATION_INVALID_CODE_MESSAGE,
    );
  }
};

/** `GET /auth/verify-email/status` — JSON-подтверждение (для клиента без redirect). */
export const verifyEmailJsonController = async (req, res) => {
  const token = req.query?.token;
  try {
    await verifyEmailByToken(token);
  } catch (verificationError) {
    return errorRes(
      res,
      400,
      verificationError instanceof Error
        ? verificationError.message
        : EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE,
    );
  }
  return successRes(res, { message: EMAIL_VERIFICATION_SUCCESS_MESSAGE });
};
