import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";

export const getMyLoyaltyPointsStatusController = async (req, res) => {
const userId = String(req.userId);
    const user = await UserModel.findById(userId).select("userLoyaltyPoints").lean();

    if (!user) {
      return errorRes(res, 404, "Пользователь не найден");
    }

    return successRes(res, {
      loyaltyPointsBalance: Number(user.userLoyaltyPoints) || 0,
    });
};
