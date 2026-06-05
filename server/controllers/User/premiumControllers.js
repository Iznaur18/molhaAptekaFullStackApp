import { UserModel } from "../../models/index.js";
import {
  PREMIUM_ALREADY_ACTIVE_MESSAGE,
  PREMIUM_PRICE_POINTS,
  PREMIUM_PURCHASE_SUCCESS_MESSAGE,
} from "../../constants/premiumConstants.js";
import {
  isPremiumActive,
  PremiumAlreadyActiveError,
  purchasePremiumSubscription,
  syncPremiumExpiryForUser,
} from "../../utils/premiumAccess.js";
import { InsufficientLoyaltyPointsError } from "../../utils/loyaltyPointsSpend.js";
import { errorRes, successRes } from "../../utils/index.js";

export const getMyPremiumStatusController = async (req, res) => {
  try {
    const userId = String(req.userId);
    await syncPremiumExpiryForUser(userId);

    const user = await UserModel.findById(userId)
      .select("isPremiumUser premiumExpiresAt userLoyaltyPoints isBlockedUser")
      .lean();

    if (!user) {
      return errorRes(res, 404, "Пользователь не найден");
    }

    const isActive = isPremiumActive(user);
    const loyaltyPoints = Number(user.userLoyaltyPoints) || 0;

    return successRes(res, {
      isActive,
      premiumExpiresAt: user.premiumExpiresAt ?? null,
      canPurchase: !isActive && user.isBlockedUser !== true,
      pricePoints: PREMIUM_PRICE_POINTS,
      loyaltyPointsBalance: loyaltyPoints,
    });
  } catch (error) {
    console.error("getMyPremiumStatusController error:", error);
    return errorRes(res, 500, "Ошибка при загрузке статуса премиума");
  }
};

export const purchasePremiumController = async (req, res) => {
  try {
    const userId = String(req.userId);
    await syncPremiumExpiryForUser(userId);

    const result = await purchasePremiumSubscription(userId);

    return successRes(res, {
      message: PREMIUM_PURCHASE_SUCCESS_MESSAGE,
      premiumExpiresAt: result.premiumExpiresAt,
      loyaltyPointsBalance: result.loyaltyPointsBalance,
      isActive: true,
    });
  } catch (error) {
    if (error instanceof PremiumAlreadyActiveError) {
      return errorRes(res, 409, PREMIUM_ALREADY_ACTIVE_MESSAGE);
    }
    if (error instanceof InsufficientLoyaltyPointsError) {
      return errorRes(
        res,
        409,
        `Недостаточно баллов. Нужно: ${error.required}, у вас: ${error.available}`,
      );
    }
    if (error instanceof Error) {
      if (error.message === "USER_BLOCKED") {
        return errorRes(res, 403, "Аккаунт заблокирован");
      }
      if (error.message === "USER_NOT_FOUND") {
        return errorRes(res, 404, "Пользователь не найден");
      }
    }
    console.error("purchasePremiumController error:", error);
    return errorRes(res, 500, "Ошибка при покупке премиума");
  }
};
