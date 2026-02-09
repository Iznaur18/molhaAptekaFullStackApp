import { UserVoteRatingModel, UserModel } from '../models/index.js';
import { errorRes, successRes } from '../utils/index.js';

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
            await vote.populate([
            { path: 'userVoter', select: 'userName email' },
            { path: 'userVoteTarget', select: 'userName email' },
        ]); // популируем пользователя который проголосовал и целевого пользователя

        // 8. Обновляем агрегат рейтинга у целевого пользователя (одним атомарным запросом)
        const updatedUserVoteTarget = await UserModel.findByIdAndUpdate( // обновляем целевого пользователя в базе данных
            userVoteTargetIdClient, // id целевого пользователя из клиентского запроса
            {
                $inc: {
                    'userRatingByVotes.countVotes': 1, // увеличиваем количество проголосовавших за пользователя
                    'userRatingByVotes.totalRating': userVoteValue, // увеличиваем общее количество рейтинга
                },
            },
            { new: true } // возвращаем обновленный документ
        )
        .select('_id userRatingByVotes userName email userAvatarUrl') // в ответ клиенту только _id и рейтинг, без лишних/чувствительных полей
        .lean(); // возвращаем обновленный документ в формате JSON

            return successRes(res, { user: updatedUserVoteTarget, message: 'Голос успешно поставлен' });
        } catch (errorAfterSave) {
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
        console.error('Vote error:', error);
        const message = error.message || 'Ошибка при голосовании за пользователя';
        return errorRes(res, 500, message);
    }
};

/** Получение рейтинга пользователя. GET /user/rating/:userId */