import { UserModel } from '../../models/index.js';

export const removeTelegramUserFieldsUp = async () => {
    await UserModel.updateMany(
        {},
        {
            $unset: {
                telegramUserId: '',
                telegramUsername: '',
                telegramPhotoUrl: '',
            },
        },
    );

    try {
        await UserModel.collection.dropIndex('telegramUserId_1');
    } catch {
        // индекс уже удалён или не создавался
    }
};
