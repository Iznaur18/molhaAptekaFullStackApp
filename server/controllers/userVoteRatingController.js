import { UserVoteRatingModel, UserModel } from '../models/index.js';
import { errorRes, successRes } from '../utils/index.js';
import { USER_ME_RAITING } from '../constants/constants.js';

/** Голосование за пользователя. POST /user/vote */
export const userVoteRatingController = async (req, res) => {
    try {
        // 1. Достаём из запроса: id цели голосования (params), оценку 1–10 (body), id голосующего (из auth middleware)
        const { userVoteTargetIdClient } = req.params; // id пользователя за которого проголосовали
        const { userVoteValueClient } = req.body; // значение голоса которое пользователь ставит за целевого пользователя
        const userVoterIdClient = req.userId; // id пользователя который проголосовал из auth middleware

        // 2. Проверка наличия обязательных полей
        if (!userVoteTargetIdClient || userVoteValueClient == null || !userVoterIdClient) {
            return errorRes(res, 400, 'Не все поля заполнены');
        }

        // 3. Оценка должна быть числом от 1 до 10
        const userVoteValue = Math.round(Number(userVoteValueClient)); // значение голоса, округленное до целого
        if (Number.isNaN(userVoteValue) || userVoteValue < 1 || userVoteValue > 10) {
            return errorRes(res, 400, 'Оценка должна быть числом от 1 до 10');
        }

        // 4. Запрет голосовать за себя (явная проверка — в ответе 400, а не 500)
        if (String(userVoterIdClient) === String(userVoteTargetIdClient)) {
            return errorRes(res, 400, 'Нельзя голосовать за самого себя');
        }

        // 5. Проверяем, не голосовал ли уже этот пользователь за этого целевого
        const existingUserVoteRating = await UserVoteRatingModel.findOne({
            userVoter: userVoterIdClient,
            userVoteTarget: userVoteTargetIdClient,
        });
        if (existingUserVoteRating) { // если голос уже существует, возвращаем ошибку
            return errorRes(res, 400, 'Вы уже голосовали за этого пользователя');
        }

        // 6. Проверяем, что целевой пользователь существует
        const userVoteTarget = await UserModel.findById(userVoteTargetIdClient);
        if (!userVoteTarget) { // если целевой пользователь не найден, возвращаем ошибку
            return errorRes(res, 404, 'Целевой пользователь не найден');
        }

        // 7. Создаём и сохраняем запись голоса (в модели есть запрет голосовать за себя)
        const vote = new UserVoteRatingModel({ // создаем новый голос в базе данных о голосовании за целевого пользователя с указанным значением голоса
            userVoter: userVoterIdClient, // id пользователя который проголосовал из клиентского запроса добавляем в базу данных
            userVoteTarget: userVoteTargetIdClient,
            userVoteValue: userVoteValue,
        });
        
        await vote.save();

        try {
            // Популируем связи: подставляем данные голосующего и целевого пользователя вместо ObjectId
            await vote.populate([
                { path: 'userVoter', select: 'userName email' },
                { path: 'userVoteTarget', select: 'userName email' },
            ]);

        // 8. Обновляем агрегат рейтинга у целевого пользователя атомарно ($inc)
        const updatedUserVoteTarget = await UserModel.findByIdAndUpdate(
            userVoteTargetIdClient,
            {
                $inc: {
                    'userRatingByVotes.countVotes': 1,    // +1 к числу голосов
                    'userRatingByVotes.totalRating': userVoteValue, // прибавляем оценку к сумме
                },
            },
            { new: true }                                 // возвращаем обновлённый документ
        )
            .select('_id userRatingByVotes userName email userAvatarUrl')
            .lean();

            return successRes(res, { user: updatedUserVoteTarget, message: 'Голос успешно поставлен' });
        } catch (errorAfterSave) {
            // Откат при ошибке: удаляем голос и отменяем изменения рейтинга у целевого пользователя
            await UserVoteRatingModel.findByIdAndDelete(vote._id);
            await UserModel.findByIdAndUpdate(userVoteTargetIdClient, {
                $inc: {
                    'userRatingByVotes.countVotes': -1,
                    'userRatingByVotes.totalRating': -userVoteValue,
                },
            });
            throw errorAfterSave;
        }
    } catch (error) {
        // Любая неожиданная ошибка — логируем и отдаём 500
        console.error('Vote error:', error);
        const message = error.message || 'Ошибка при голосовании за пользователя';
        return errorRes(res, 500, message);
    }
};

/** Получение рейтинга пользователя. GET /user/rating/:userId */

export const userGetRatingController = async (req, res) => {
    try {
        // 1. Извлекаем id пользователя из параметров URL-адреса
        const { userIdClient } = req.params; // название userIdClient, обязательно для запроса в URL роута

        // 2. Проверяем наличие id — без него запрос невалиден
        if (!userIdClient) {
            return errorRes(res, 400, 'ID пользователя обязателен');
        }

        // 3. Ищем пользователя в БД по id, выбираем только нужные поля (без пароля и т.п.)
        const userIdServer = await UserModel.findById(userIdClient)
            .select(USER_ME_RAITING)
            .lean(); // Запросы только для чтения. Когда нужно вернуть данные в API. Когда не планируется вызывать .save() или методы mongoose для результата.

        // 4. Если пользователь не найден — возвращаем 404
        if (!userIdServer) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        // 5. Достаём из документа счётчики голосов и сумму оценок (если нет — берём 0)
        const { countVotes = 0, totalRating = 0 } = userIdServer.userRatingByVotes || {};
        // 6. Считаем средний рейтинг: сумма оценок / количество голосов (деление на ноль избегаем)
        const averageRating = countVotes > 0 ? totalRating / countVotes : 0;

        // 7. Отдаём клиенту данные пользователя и рейтинг (среднее округлено до 1 знака)
        return successRes(res, {
            user: {
                _id: userIdServer._id,
                userName: userIdServer.userName,
                userAvatarUrl: userIdServer.userAvatarUrl,
                rating: {
                    countVotes,
                    totalRating,
                    averageRating: Math.round(averageRating * 10) / 10,
                },
            },
        });
    } catch (error) {
        // Ошибка при запросе к БД или иная — отдаём 500
        console.error('Get rating error:', error);
        return errorRes(res, 500, error.message || 'Ошибка при получении рейтинга');
    }
};