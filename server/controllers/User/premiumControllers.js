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
} from "../../services/user/premiumAccess.js";
import { InsufficientLoyaltyPointsError } from "../../services/loyalty/loyaltyPointsSpend.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

export const getMyPremiumStatusController = async (req, res) => {
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
};

export const purchasePremiumController = async (req, res) => {
  try {
    const userId = String(req.userId);
    await syncPremiumExpiryForUser(userId);

    const result = await purchasePremiumSubscription(userId, {
      idempotencyKey: req.body.idempotencyKey,
    });

    return successRes(res, {
      message: PREMIUM_PURCHASE_SUCCESS_MESSAGE,
      premiumExpiresAt: result.premiumExpiresAt,
      loyaltyPointsBalance: result.loyaltyPointsBalance,
      isActive: true,
      duplicate: Boolean(result.duplicate),
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
      if (error.message === "Укажите idempotencyKey для денежной операции") {
        return errorRes(res, 400, error.message);
      }
    }
    logServerEvent("error", {
      event: "purchasepremiumcontroller",
      error: error instanceof Error ? error.message : String(error),
    });
    return errorRes(res, 500, "Ошибка при покупке премиума");
  }
};
