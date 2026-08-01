import {
  computeAffiliatePayoutAmount,
  formatAffiliateEnableInsufficientLoyaltyMessage,
} from "@izibuy/shared-lib";

import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { getSellerLoyaltyPointsAvailable } from "../loyalty/loyaltyPointsSeller.js";

/**
 * Блок включения партнёрки, если свободно баллов меньше выплаты за 1 шт.
 * Уже включённые товары не трогает (вызывающий сам решает когда звать).
 *
 * @param {{
 *   sellerId: string;
 *   productPrice: unknown;
 *   affiliatePercent: unknown;
 * }} input
 */
export async function assertSellerCanEnableAffiliate({
  sellerId,
  productPrice,
  affiliatePercent,
}) {
  const required = computeAffiliatePayoutAmount(productPrice, affiliatePercent);
  if (required <= 0) {
    return;
  }

  const user = await UserModel.findById(sellerId)
    .select("userLoyaltyPoints userLoyaltyPointsReserved")
    .lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const available = getSellerLoyaltyPointsAvailable(user);
  if (available < required) {
    throw new AppError(
      400,
      formatAffiliateEnableInsufficientLoyaltyMessage(required, available),
    );
  }
}
