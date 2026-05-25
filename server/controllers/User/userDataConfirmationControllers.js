import { UserDataConfirmationRequestModel, UserModel } from '../../models/index.js';
import {
    USER_DATA_CONFIRMATION_ALREADY_CONFIRMED_MESSAGE,
    USER_DATA_CONFIRMATION_ALREADY_PENDING_MESSAGE,
    USER_DATA_CONFIRMATION_STATUS_PENDING,
} from '../../constants/userDataConfirmationConstants.js';
import {
    getLatestDataConfirmationRequestForUser,
    getPendingDataConfirmationRequests,
    resolveDataConfirmationRequest,
} from '../../utils/userDataConfirmationHelpers.js';
import { normalizePassportPayload } from '../../utils/validatePassportPayload.js';
import { errorRes, successRes } from '../../utils/index.js';

/**
 * `POST /user/me/data-confirmation-request`
 */
export const submitDataConfirmationRequestController = async (req, res) => {
    try {
        const userId = String(req.userId);

        const user = await UserModel.findById(userId)
            .select('isUserDataConfirmed isBlockedUser')
            .lean();

        if (!user) {
            return errorRes(res, 401, 'Пользователь не найден');
        }
        if (user.isBlockedUser) {
            return errorRes(res, 403, 'Аккаунт заблокирован');
        }
        if (user.isUserDataConfirmed === true) {
            return errorRes(
                res,
                400,
                USER_DATA_CONFIRMATION_ALREADY_CONFIRMED_MESSAGE,
            );
        }

        const existingPending = await UserDataConfirmationRequestModel.findOne(
            {
                userId,
                status: USER_DATA_CONFIRMATION_STATUS_PENDING,
            },
        ).lean();

        if (existingPending) {
            return errorRes(
                res,
                409,
                USER_DATA_CONFIRMATION_ALREADY_PENDING_MESSAGE,
            );
        }

        let passport;
        try {
            passport = normalizePassportPayload(req.body?.passport ?? req.body);
        } catch (validationError) {
            return errorRes(
                res,
                400,
                validationError instanceof Error
                    ? validationError.message
                    : 'Некорректные паспортные данные',
            );
        }

        await UserDataConfirmationRequestModel.create({
            userId,
            passport,
        });

        return successRes(res, { message: 'Заявка принята' });
    } catch (error) {
        if (error?.code === 11000) {
            return errorRes(
                res,
                409,
                USER_DATA_CONFIRMATION_ALREADY_PENDING_MESSAGE,
            );
        }
        console.error('submitDataConfirmationRequest error:', error);
        return errorRes(res, 500, 'Ошибка при подаче заявки');
    }
};

/**
 * `GET /user/me/data-confirmation-request`
 */
export const getMyDataConfirmationRequestController = async (req, res) => {
    try {
        const userId = String(req.userId);
        const user = await UserModel.findById(userId)
            .select('isUserDataConfirmed')
            .lean();

        if (!user) {
            return errorRes(res, 401, 'Пользователь не найден');
        }

        const request = await getLatestDataConfirmationRequestForUser(userId);

        return successRes(res, {
            isUserDataConfirmed: user.isUserDataConfirmed === true,
            request,
        });
    } catch (error) {
        console.error('getMyDataConfirmationRequest error:', error);
        return errorRes(res, 500, 'Ошибка при получении заявки');
    }
};

/**
 * `GET /user/data-confirmation-requests/pending`
 */
export const getPendingDataConfirmationRequestsController = async (
    req,
    res,
) => {
    try {
        const { requests, totalPending } =
            await getPendingDataConfirmationRequests();
        return successRes(res, { requests, totalPending });
    } catch (error) {
        console.error('getPendingDataConfirmationRequests error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке заявок');
    }
};

/**
 * `GET /user/data-confirmation-requests/pending/count`
 */
export const getPendingDataConfirmationRequestsCountController = async (
    req,
    res,
) => {
    try {
        const totalPending = await UserDataConfirmationRequestModel.countDocuments(
            { status: USER_DATA_CONFIRMATION_STATUS_PENDING },
        );
        return successRes(res, { totalPending });
    } catch (error) {
        console.error('getPendingDataConfirmationRequestsCount error:', error);
        return errorRes(res, 500, 'Ошибка при подсчёте заявок');
    }
};

/**
 * `PATCH /user/data-confirmation-requests/:requestId/resolve`
 */
export const resolveDataConfirmationRequestController = async (req, res) => {
    try {
        const staffUserId = req.userId;
        const { requestId } = req.params;
        const resolution = String(req.body?.resolution ?? '').trim();
        const staffNote = String(req.body?.staffNote ?? '').trim();

        try {
            const result = await resolveDataConfirmationRequest(
                requestId,
                staffUserId,
                resolution,
                staffNote,
            );
            return successRes(res, result);
        } catch (e) {
            const message =
                e instanceof Error ? e.message : 'Не удалось рассмотреть заявку';
            const status =
                message === 'Заявка не найдена'
                    ? 404
                    : message === 'Заявка уже рассмотрена'
                      ? 409
                      : 400;
            return errorRes(res, status, message);
        }
    } catch (error) {
        console.error('resolveDataConfirmationRequest error:', error);
        return errorRes(res, 500, 'Ошибка при рассмотрении заявки');
    }
};
