import { UserModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

export const getMyLoyaltyPointsStatusController = async (req, res) => {
    try {
        const userId = String(req.userId);
        const user = await UserModel.findById(userId)
            .select('userLoyaltyPoints')
            .lean();

        if (!user) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        return successRes(res, {
            loyaltyPointsBalance: Number(user.userLoyaltyPoints) || 0,
        });
    } catch (error) {
        console.error('getMyLoyaltyPointsStatusController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке раздела баллов');
    }
};
