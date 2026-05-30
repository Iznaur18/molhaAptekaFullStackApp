import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { UserModel, UserVoteRatingModel } from '../../models/index.js';
import { deleteAllFollowsForUser } from '../../utils/userFollowHelpers.js';
import { sendUserWithToken, errorRes, successRes } from '../../utils/index.js';
import {
    USER_DATA,
    ALLOWED_FIELDS_FOR_USER,
    ALLOWED_FIELDS_FOR_ADMIN,
    ALLOWED_FIELDS_FOR_ADMIN_SELF,
    ALLOWED_FIELDS_FOR_MODERATOR,
} from '../../constants/constants.js';
import { isStaffRole } from '../../utils/adminUserGuard.js';
import {
    assertCanDeleteUser,
    assertCanSetUserRole,
} from '../../utils/adminUserGuard.js';
import { deleteSellerProductsAndRelatedData } from '../../utils/deleteUserCascade.js';
import { getOptionalViewerFromRequest } from '../../utils/optionalViewerFromRequest.js';
import { sanitizeUserProfileForViewer } from '../../utils/userProfileVisibility.js';
import { attachFollowFieldsToPublicProfile } from '../../utils/userFollowHelpers.js';
import {
    backgroundValueAfterPremiumChange,
    normalizeUserBackgroundForSave,
} from '../../utils/userBackgroundValue.js';
import {
    normalizeUserAvatarFocus,
    normalizeUserBackgroundFocus,
} from '../../utils/profileImageFocus.js';
import { getUnreadInAppNotificationsForUser } from '../../utils/userInAppNotifications.js';
import { buildUserProfileMongoUpdate } from '../../utils/buildUserProfileMongoUpdate.js';
import { rejectPendingDataConfirmationForUser } from '../../utils/userDataConfirmationHelpers.js';

/** Вход по email + пароль. POST /auth/login */
export const loginUserController = async (req, res) => { // обработчик входа по email + пароль
    try {
        const { email, password } = req.body; // извлекаем email и пароль из тела запроса (валидация выполняется в middleware loginUserValidation)

        const user = await UserModel.findOne({ email }).select('+passwordHash'); // ищем пользователя по email и выбираем поле passwordHash для сравнения пароля с переданным паролем из запроса

        if (!user) { // если пользователь не найден, возвращаем ошибку
            return errorRes(res, 400, 'Неверный email или пароль');
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash); // сравниваем пароль из запроса с паролем из базы данных

        if (!isValidPassword) { // если пароль из запроса не совпадает с паролем из базы данных, возвращаем ошибку
            return errorRes(res, 400, 'Неверный email или пароль');
        }

        if (user.isBlockedUser) {
            return errorRes(res, 403, 'Аккаунт заблокирован');
        }

        if (user.isActiveUser === false) {
            return errorRes(res, 403, 'Аккаунт отключён администратором');
        }

        user.userLastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });

        return sendUserWithToken(user, res); // отправляем пользователя с токеном вход по email + пароль

    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при входе'); // если произошла ошибка, возвращаем ошибку
    }
};

/** Получение данных текущего пользователя. GET /auth/me (требует Authorization: Bearer <token>) */
export const userMeController = async (req, res) => {
    try {
        // 1. id текущего пользователя из auth middleware (JWT)
        const userIdClient = req.userId;

        if (!userIdClient) {
            return errorRes(res, 401, 'Вы не авторизованы');
        }

        // 2. Ищем пользователя в БД по id
        const userIdServer = await UserModel.findById(userIdClient)
            .select(USER_DATA) // Клиент получит всё что в select()
            .lean();

        if (!userIdServer) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        const userWithFollow = await attachFollowFieldsToPublicProfile(
            userIdServer,
            { viewerId: userIdClient },
        );

        const inAppNotifications = await getUnreadInAppNotificationsForUser(
            userIdClient,
        );

        return successRes(res, { user: userWithFollow, inAppNotifications });
        
    } catch (error) {
        console.error('userMe error:', error);
        return errorRes(res, 500, error.message || 'Ошибка при получении своих данных');
    }
};

/** Получение профиля другого пользователя по id. GET /user/:userId (публичный — без авторизации) */
export const userGetProfileController = async (req, res) => {
    try {
        const { userIdClient } = req.params; // id юзера из URL (валидация выполняется в middleware userIdParamValidation)

        const userIdServer = await UserModel.findById(userIdClient)
            .select(USER_DATA)
            .lean();

        if (!userIdServer) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        const viewer = await getOptionalViewerFromRequest(req);

        if (userIdServer.isBlockedUser) {
            const isAdminViewer =
                viewer?.userRole === 'admin' && !viewer.isBlockedUser;
            if (!isAdminViewer) {
                return errorRes(res, 404, 'Пользователь не найден');
            }
        }

        const publicUser = sanitizeUserProfileForViewer(userIdServer, {
            viewer,
            viewerId: viewer?._id ?? null,
        });
        if (!publicUser) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        const userWithFollow = await attachFollowFieldsToPublicProfile(
            publicUser,
            { viewerId: viewer?._id ?? null },
        );

        return successRes(res, { user: userWithFollow });
        
    } catch (error) {
        console.error('userGetProfile error:', error);
        return errorRes(res, 500, error.message || 'Ошибка при получении профиля');
    }
};

/** Обновление профиля пользователя. PATCH /user/:userId (требует Authorization: Bearer <token>) */
export const userUpdateProfileController = async (req, res) => {
    try {
        const currentUserId = req.userId; // кто обновляет (id из auth middleware) Прошел ли JWT авторизацию
        const targetUserId = req.params.userIdClient; // кого обновляем (id из URL) ID пользователя которого обновляем (валидация выполняется в middleware userIdParamValidation)

        // 1. Проверка существования текущего пользователя
        const currentUserRole = await UserModel.findById(currentUserId).select('userRole').lean(); // ищем пользователя в БД по id и выбираем поле userRole

        if (!currentUserRole) {
            return errorRes(res, 401, 'Текущий пользователь не найден. Токен недействителен');
        }

        const isCurrentUserOwner = String(currentUserId) === String(targetUserId);
        const editorRole = currentUserRole.userRole;
        const isCurrentUserAdmin = editorRole === 'admin';
        const isCurrentUserStaff = isStaffRole(editorRole);

        if (!isCurrentUserOwner && !isCurrentUserStaff) {
            return errorRes(res, 403, 'У вас нет прав на обновление этого профиля');
        }

        const updateData = {};
        const allowedFields = isCurrentUserOwner
            ? isCurrentUserAdmin
                ? ALLOWED_FIELDS_FOR_ADMIN_SELF
                : ALLOWED_FIELDS_FOR_USER
            : isCurrentUserAdmin
              ? ALLOWED_FIELDS_FOR_ADMIN
              : ALLOWED_FIELDS_FOR_MODERATOR;

        // 3. Сбор и конвертация данных для обновления (валидация форматов и типов выполняется в middleware updateProfileValidation)
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) { // если поле есть в запросе и не undefined, то добавляем его в updateData
                const value = req.body[field]; // значение поля из запроса (уже валидировано в middleware)

                // Конвертация типов данных (валидация форматов уже выполнена в middleware)
                if (field === 'userBirthDate') {
                    // Конвертация даты (валидация формата и диапазона уже выполнена в middleware)
                    if (value !== null && value !== '') {
                        updateData[field] = new Date(value); // конвертируем строку в Date объект
                    } else {
                        updateData[field] = null; // разрешаем очистку поля
                    }
                } else if (field === 'userDiscountPercent') {
                    // Конвертация в число (валидация диапазона уже выполнена в middleware)
                    updateData[field] = Number(value);
                } else if (field === 'userName') {
                    updateData[field] =
                        typeof value === 'string' ? value.trim().toLowerCase() : value;
                } else if (
                    field === 'userPhoneNumber' ||
                    field === 'userAddress' ||
                    field === 'userAddressFlat' ||
                    field === 'userAddressFiasId' ||
                    field === 'notesAboutUser'
                ) {
                    // Для строковых полей применяем trim (валидация уже выполнена в middleware)
                    updateData[field] = typeof value === 'string' ? value.trim() : value;
                } else if (field === 'userAddressGeo') {
                    updateData[field] = value;
                } else if (field === 'userAvatarFocus') {
                    updateData[field] = normalizeUserAvatarFocus(value);
                } else if (field === 'userBackgroundFocus') {
                    updateData[field] = normalizeUserBackgroundFocus(value);
                } else {
                    // Для остальных полей (userGender, userRole, URL поля, булевы) - просто присваиваем (валидация уже выполнена в middleware)
                    updateData[field] = value;
                }
            }
        }

        if (req.verifiedDeliveryAddress !== undefined) {
            if (req.verifiedDeliveryAddress === null) {
                updateData.userAddress = null;
                updateData.userAddressFlat = null;
                updateData.userAddressFiasId = null;
                updateData.userAddressGeo = null;
            } else {
                const verified = req.verifiedDeliveryAddress;
                updateData.userAddress = verified.displayAddress;
                updateData.userAddressFlat = verified.flat;
                updateData.userAddressFiasId = verified.fiasId;
                updateData.userAddressGeo = verified.geo;
            }
        }

        // 4. Проверка, что есть данные для обновления
        if (Object.keys(updateData).length === 0) {
            return errorRes(res, 400, 'Нет данных для обновления. Укажите хотя бы одно разрешенное поле');
        }

        if (updateData.userRole !== undefined) {
            if (!isCurrentUserAdmin) {
                return errorRes(res, 403, 'Только администратор может менять роль');
            }
            try {
                await assertCanSetUserRole(targetUserId, updateData.userRole);
            } catch (e) {
                return errorRes(
                    res,
                    400,
                    e instanceof Error ? e.message : 'Нельзя изменить роль',
                );
            }
        }

        if (updateData.userDiscountPercent !== undefined && !isCurrentUserAdmin) {
            return errorRes(res, 403, 'Только администратор может менять скидку');
        }

        if (updateData.isPremiumUser !== undefined && !isCurrentUserAdmin) {
            return errorRes(res, 403, 'Только администратор может менять премиум');
        }

        // 5. Проверка уникальности userName и userPhoneNumber перед обновлением
        if (updateData.userName) {
            const existingUser = await UserModel.findOne({ userName: updateData.userName, _id: { $ne: targetUserId } }); 
            if (existingUser) {
                return errorRes(res, 409, 'Пользователь с таким именем уже существует');
            }
        }

        if (updateData.userPhoneNumber && updateData.userPhoneNumber !== null && updateData.userPhoneNumber !== '') {
            const existingPhone = await UserModel.findOne({ userPhoneNumber: updateData.userPhoneNumber, _id: { $ne: targetUserId } });
            if (existingPhone) {
                return errorRes(res, 409, 'Пользователь с таким номером телефона уже существует');
            }
        }

        const targetUserBeforeUpdate = await UserModel.findById(targetUserId)
            .select('isPremiumUser userBackgroundUrl isUserDataConfirmed')
            .lean();

        if (!targetUserBeforeUpdate) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        const wasPremium = Boolean(targetUserBeforeUpdate.isPremiumUser);
        const nextPremium =
            updateData.isPremiumUser !== undefined
                ? Boolean(updateData.isPremiumUser)
                : wasPremium;

        if (wasPremium && !nextPremium) {
            updateData.userBackgroundUrl = backgroundValueAfterPremiumChange(
                wasPremium,
                nextPremium,
                targetUserBeforeUpdate.userBackgroundUrl,
            );
        } else if (updateData.userBackgroundUrl !== undefined) {
            try {
                updateData.userBackgroundUrl = normalizeUserBackgroundForSave(
                    updateData.userBackgroundUrl,
                    {
                        isPremiumUser: nextPremium,
                        isAdminEditor: isCurrentUserStaff,
                    },
                );
            } catch (e) {
                return errorRes(
                    res,
                    400,
                    e instanceof Error ? e.message : 'Некорректный фон профиля',
                );
            }
        }

        const wasDataConfirmed = Boolean(
            targetUserBeforeUpdate.isUserDataConfirmed,
        );
        const nextDataConfirmed =
            updateData.isUserDataConfirmed !== undefined
                ? Boolean(updateData.isUserDataConfirmed)
                : wasDataConfirmed;

        if (wasDataConfirmed && !nextDataConfirmed) {
            try {
                await rejectPendingDataConfirmationForUser(
                    targetUserId,
                    undefined,
                    isCurrentUserStaff ? currentUserId : null,
                );
            } catch (rejectError) {
                console.error(
                    'rejectPendingDataConfirmationForUser error:',
                    rejectError,
                );
            }
        }

        // 6. Логирование изменений (для аудита)
        const mongoUpdate = buildUserProfileMongoUpdate(updateData);
        if (Object.keys(mongoUpdate).length === 0) {
            return errorRes(res, 400, 'Нет данных для обновления. Укажите хотя бы одно разрешенное поле');
        }
        console.log(
            `[UPDATE PROFILE] User ${currentUserId} updating profile ${targetUserId}. Update: ${JSON.stringify(mongoUpdate)}`,
        );

        // 7. Обновление профиля пользователя
        const selectFields = isCurrentUserStaff && !isCurrentUserOwner
            ? USER_DATA
            : allowedFields.join(' ');
        const userDataUpdated = await UserModel.findByIdAndUpdate(
            targetUserId,
            mongoUpdate,
            { returnDocument: 'after', runValidators: true },
        )
            .select(selectFields)
            .lean();

        if (!userDataUpdated) {
            return errorRes(res, 404, 'Пользователь не найден или не удалось обновить');
        }

        return successRes(res, { user: userDataUpdated, message: 'Профиль успешно обновлен' });

    } catch (error) {
        console.error('userUpdateProfile error:', error);

        // Обработка специфичных ошибок MongoDB
        if (error.name === 'ValidationError') {
            // Ошибка валидации схемы Mongoose
            const errors = Object.values(error.errors).map(err => err.message).join(', ');
            return errorRes(res, 400, `Ошибка валидации: ${errors}`);
        }

        if (error.name === 'CastError') {
            // Ошибка приведения типа (например, неверный формат ObjectId)
            return errorRes(res, 400, `Неверный формат данных: ${error.message}`);
        }

        if (error.code === 11000) {
            // Ошибка дубликата уникального ключа
            const field = Object.keys(error.keyPattern)[0];
            return errorRes(res, 409, `Пользователь с таким ${field} уже существует`);
        }

        // Общая ошибка сервера
        return errorRes(res, 500, error.message || 'Ошибка при обновлении профиля');
    }
};

/** Удаление профиля пользователя. DELETE /user/:userId (требует Authorization: Bearer <token>) */
export const userDeleteProfileController = async (req, res) => {
    try {
        const currentUserId = req.userId; // кто удаляет (id из auth middleware) Прошел ли JWT авторизацию
        const targetUserId = req.params.userIdClient; // кого удаляем (id из URL) ID пользователя которого удаляем (валидация выполняется в middleware userIdParamValidation)

        // 1. Проверка существования текущего пользователя
        const currentUserRole = await UserModel.findById(currentUserId).select('userRole').lean();
        if (!currentUserRole) {
            return errorRes(res, 401, 'Текущий пользователь не найден. Токен недействителен');
        }

        // 3. Проверка существования целевого пользователя
        const targetUser = await UserModel.findById(targetUserId).select('_id userName').lean();
        if (!targetUser) {
            return errorRes(res, 404, 'Пользователь для удаления не найден');
        }

        const isCurrentUserOwner = String(currentUserId) === String(targetUserId); // текущий пользователь является владельцем удаляемого профиля
        const isCurrentUserAdmin = currentUserRole.userRole === 'admin'; // текущий пользователь является администратором

        if (!isCurrentUserOwner && !isCurrentUserAdmin) {
            return errorRes(res, 403, 'У вас нет прав на удаление этого профиля');
        }

        try {
            await assertCanDeleteUser(targetUserId);
        } catch (e) {
            return errorRes(
                res,
                400,
                e instanceof Error ? e.message : 'Нельзя удалить пользователя',
            );
        }

        // 4. Логирование удаления (для аудита)
        console.log(`[DELETE PROFILE] User ${currentUserId} deleting profile ${targetUserId} (${targetUser.userName || 'N/A'})`);

        let cascadeSummary = { deletedProductCount: 0, updatedCarts: 0 };
        try {
            cascadeSummary = await deleteSellerProductsAndRelatedData(targetUserId);
        } catch (cascadeError) {
            const statusCode =
                cascadeError &&
                typeof cascadeError === 'object' &&
                'statusCode' in cascadeError &&
                cascadeError.statusCode === 409
                    ? 409
                    : 500;
            const message =
                cascadeError instanceof Error
                    ? cascadeError.message
                    : 'Ошибка при удалении товаров пользователя';
            return errorRes(res, statusCode, message);
        }
        console.log(
            `[DELETE PROFILE] Deleted ${cascadeSummary.deletedProductCount} products, updated ${cascadeSummary.updatedCarts} carts for user ${targetUserId}`,
        );

        // Каскад: голоса
        const deletedVotes = await UserVoteRatingModel.deleteMany({
            $or: [
                { userVoter: targetUserId },
                { userVoteTarget: targetUserId }
            ]
        });
        console.log(`[DELETE PROFILE] Deleted ${deletedVotes.deletedCount} vote records for user ${targetUserId}`);

        await deleteAllFollowsForUser(targetUserId);
        console.log(
            `[DELETE PROFILE] Deleted follow records for user ${targetUserId}`,
        );

        // Удаление профиля пользователя
        const deletedUser = await UserModel.findByIdAndDelete(targetUserId);
        if (!deletedUser) {
            return errorRes(res, 404, 'Пользователь не найден или уже был удален');
        }

        return successRes(res, { message: 'Профиль успешно удален' });

    } catch (error) {
        console.error('userDeleteProfile error:', error);

        // Обработка специфичных ошибок MongoDB
        if (error.name === 'CastError') {
            return errorRes(res, 400, `Неверный формат данных: ${error.message}`);
        }

        // Общая ошибка сервера
        return errorRes(res, 500, error.message || 'Ошибка при удалении профиля');
    }
};

