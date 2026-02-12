import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { UserModel, UserVoteRatingModel } from '../models/index.js';
import { sendUserWithToken, errorRes, successRes } from '../utils/index.js';
import { USER_DATA, ALLOWED_FIELDS_FOR_USER, ALLOWED_FIELDS_FOR_ADMIN } from '../constants/constants.js';

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

        return successRes(res, { user: userIdServer });
        
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

        return successRes(res, { user: userIdServer });
        
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

        const isCurrentUserOwner = String(currentUserId) === String(targetUserId); // текущий пользователь является владельцем обновляемого профиля
        const isCurrentUserAdmin = currentUserRole.userRole === 'admin'; // текущий пользователь является администратором

        if (!isCurrentUserOwner && !isCurrentUserAdmin) { // если текущий пользователь не является владельцем обновляемого профиля и не является администратором, возвращаем ошибку
            return errorRes(res, 403, 'У вас нет прав на обновление этого профиля');
        }

        const updateData = {}; // объект для обновления профиля с разрешенными полями из запроса
        const allowedFields = isCurrentUserAdmin ? ALLOWED_FIELDS_FOR_ADMIN : ALLOWED_FIELDS_FOR_USER; // разрешенные поля для обновления профиля в зависимости от роли пользователя

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
                } else if (field === 'userName' || field === 'userPhoneNumber' || field === 'userAddress' || field === 'notesAboutUser') {
                    // Для строковых полей применяем trim (валидация уже выполнена в middleware)
                    updateData[field] = typeof value === 'string' ? value.trim() : value;
                } else {
                    // Для остальных полей (userGender, userRole, URL поля, булевы) - просто присваиваем (валидация уже выполнена в middleware)
                    updateData[field] = value;
                }
            }
        }

        // 4. Проверка, что есть данные для обновления
        if (Object.keys(updateData).length === 0) {
            return errorRes(res, 400, 'Нет данных для обновления. Укажите хотя бы одно разрешенное поле');
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

        // 6. Логирование изменений (для аудита)
        console.log(`[UPDATE PROFILE] User ${currentUserId} updating profile ${targetUserId}. Fields: ${Object.keys(updateData).join(', ')}`);

        // 7. Обновление профиля пользователя
        const userDataUpdated = await UserModel.findByIdAndUpdate(targetUserId, updateData, { new: true, runValidators: true }).select(allowedFields.join(' '));

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

        // 4. Логирование удаления (для аудита)
        console.log(`[DELETE PROFILE] User ${currentUserId} deleting profile ${targetUserId} (${targetUser.userName || 'N/A'})`);

        // 5. Каскадное удаление связанных данных
        // Удаляем все голоса, где пользователь был голосующим или целью голосования
        const deletedVotes = await UserVoteRatingModel.deleteMany({
            $or: [
                { userVoter: targetUserId },
                { userVoteTarget: targetUserId }
            ]
        });
        console.log(`[DELETE PROFILE] Deleted ${deletedVotes.deletedCount} vote records for user ${targetUserId}`);

        // 6. Удаление профиля пользователя
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

