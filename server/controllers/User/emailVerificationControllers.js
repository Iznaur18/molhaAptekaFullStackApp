import {
    EMAIL_VERIFICATION_ALREADY_VERIFIED_MESSAGE,
    EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE,
    EMAIL_VERIFICATION_SENT_MESSAGE,
    EMAIL_VERIFICATION_SUCCESS_MESSAGE,
} from '../../constants/emailVerificationConstants.js';
import { errorRes, successRes } from '../../utils/index.js';
import {
    sendEmailVerificationForUser,
    verifyEmailByToken,
} from '../../utils/emailVerification.js';

/** `GET /auth/verify-email?token=...` — подтверждение email по ссылке. */
export const verifyEmailController = async (req, res) => {
    try {
        const token = req.query?.token;
        const frontendUrl = (
            process.env.FRONTEND_URL ?? 'http://127.0.0.1:5173'
        ).replace(/\/$/, '');

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
    } catch (error) {
        console.error('verifyEmailController error:', error);
        return errorRes(res, 500, 'Ошибка при подтверждении email');
    }
};

/** `POST /auth/resend-verification` — повторная отправка (auth). */
export const resendEmailVerificationController = async (req, res) => {
    try {
        const userId = req.userId;

        try {
            await sendEmailVerificationForUser(userId);
        } catch (sendError) {
            const message =
                sendError instanceof Error
                    ? sendError.message
                    : 'Не удалось отправить письмо';
            const status =
                message === EMAIL_VERIFICATION_ALREADY_VERIFIED_MESSAGE
                    ? 400
                    : 400;
            return errorRes(res, status, message);
        }

        return successRes(res, { message: EMAIL_VERIFICATION_SENT_MESSAGE });
    } catch (error) {
        console.error('resendEmailVerificationController error:', error);
        return errorRes(res, 500, 'Ошибка при отправке письма');
    }
};

/** `GET /auth/verify-email/status` — JSON-подтверждение (для клиента без redirect). */
export const verifyEmailJsonController = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('verifyEmailJsonController error:', error);
        return errorRes(res, 500, 'Ошибка при подтверждении email');
    }
};
