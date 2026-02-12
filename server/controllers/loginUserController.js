import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { UserModel, UserVoteRatingModel } from '../models/index.js';
import { sendUserWithToken, errorRes, successRes } from '../utils/index.js';
import { USER_DATA, ALLOWED_FIELDS_FOR_USER, ALLOWED_FIELDS_FOR_ADMIN } from '../constants/constants.js';

/** Вход по email + пароль. POST /auth/login */
export const loginUserController = async (req, res) => { // обработчик входа по email + пароль
    try {
        const { email, password } = req.body; // извлекаем email и пароль из тела запроса

        if (!email || !password) { // если email или пароль не переданы в запросе, возвращаем ошибку
            return errorRes(res, 400, 'Укажите email и пароль');
        }

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
        const { userIdClient } = req.params; // id юзера из URL

        if (!userIdClient) {
            return errorRes(res, 400, 'ID пользователя обязателен');
        }

        // Проверка валидности ObjectId
        if (!mongoose.Types.ObjectId.isValid(userIdClient)) {
            return errorRes(res, 400, 'Неверный формат ID пользователя');
        }

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
        const targetUserId = req.params.userIdClient; // кого обновляем (id из URL) ID пользователя которого обновляем

        // 1. Проверка валидности ObjectId
        if (!mongoose.Types.ObjectId.isValid(targetUserId)) { // проверяем, является ли targetUserId валидным ObjectId
            return errorRes(res, 400, 'Неверный формат ID пользователя');
        }

        // 2. Проверка существования текущего пользователя
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

        // 3. Сбор и валидация данных для обновления
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) { // если поле есть в запросе и не undefined, то добавляем его в updateData
                const value = req.body[field]; // значение поля из запроса (строка, число, булево значение, null, undefined)

                // Валидация типов данных
                if (field === 'userBirthDate') { // если поле userBirthDate, то проверяем, является ли значение валидной датой
                    // Проверка и конвертация даты
                    if (value !== null && value !== '') { // если значение не null и не пустое, то конвертируем его в дату
                        const date = new Date(value); // конвертируем значение в дату
                        if (isNaN(date.getTime())) { // если значение не является валидной датой, возвращаем ошибку
                            return errorRes(res, 400, `Поле ${field} должно быть валидной датой`);
                        }
                        // Проверка, что дата не в будущем
                        if (date > new Date()) { // если дата в будущем, возвращаем ошибку
                            return errorRes(res, 400, 'Дата рождения не может быть в будущем');
                        }
                        updateData[field] = date; // добавляем дату в updateData
                    } else {
                        updateData[field] = null; // добавляем null в updateData
                    }
                } else if (field === 'userGender') {
                    // Валидация enum значений
                    const validGenders = ['male', 'female', 'noSelected'];
                    if (!validGenders.includes(value)) {
                        return errorRes(res, 400, `Поле ${field} должно быть одним из: ${validGenders.join(', ')}`);
                    }
                    updateData[field] = value;
                } else if (field === 'userRole') {
                    // Валидация enum значений для роли
                    const validRoles = ['user', 'admin', 'pharmacist'];
                    if (!validRoles.includes(value)) {
                        return errorRes(res, 400, `Поле ${field} должно быть одним из: ${validRoles.join(', ')}`);
                    }
                    updateData[field] = value;
                } else if (field === 'userDiscountPercent') {
                    // Валидация диапазона для процента скидки
                    const numValue = Number(value);
                    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
                        return errorRes(res, 400, 'Процент скидки должен быть числом от 0 до 100');
                    }
                    updateData[field] = numValue;
                } else if (field === 'userAvatarUrl' || field === 'userBackgroundUrl') {
                    // Валидация URL (базовая проверка)
                    if (value !== null && value !== '' && typeof value === 'string') {
                        try {
                            new URL(value); // Проверка формата URL
                            updateData[field] = value;
                        } catch {
                            return errorRes(res, 400, `Поле ${field} должно быть валидным URL`);
                        }
                    } else if (value === null || value === '') {
                        updateData[field] = value; // Разрешаем очистку
                    } else {
                        return errorRes(res, 400, `Поле ${field} должно быть строкой или null`);
                    }
                } else if (field === 'userName') {
                    // Валидация имени пользователя
                    if (value === null || value === '') {
                        return errorRes(res, 400, 'Имя пользователя не может быть пустым');
                    }
                    if (typeof value !== 'string' || value.trim().length < 3) {
                        return errorRes(res, 400, 'Имя пользователя должно быть строкой не менее 3 символов');
                    }
                    updateData[field] = value.trim();
                } else if (field === 'userPhoneNumber') {
                    // Валидация номера телефона (разрешаем null для очистки)
                    if (value !== null && value !== '') {
                        if (typeof value !== 'string') {
                            return errorRes(res, 400, 'Номер телефона должен быть строкой');
                        }
                        updateData[field] = value.trim();
                    } else {
                        updateData[field] = value; // Разрешаем null или пустую строку
                    }
                } else if (field === 'isActiveUser' || field === 'isBlockedUser' || field === 'isPremiumUser' || field === 'notificationsEnabled') {
                    // Валидация булевых значений
                    if (typeof value !== 'boolean') {
                        return errorRes(res, 400, `Поле ${field} должно быть булевым значением (true/false)`);
                    }
                    updateData[field] = value;
                } else {
                    // Для остальных полей (userAddress, notesAboutUser) - просто присваиваем
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
        const targetUserId = req.params.userIdClient; // кого удаляем (id из URL) ID пользователя которого удаляем

        // 1. Проверка валидности ObjectId
        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return errorRes(res, 400, 'Неверный формат ID пользователя');
        }

        // 2. Проверка существования текущего пользователя
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

