import { UserModel } from "../../models/index.js";

import {
  getSellerLoyaltyPointsAvailable,
  normalizeProductLoyaltyPointsPerUnit,
} from "../loyalty/loyaltyPointsSeller.js";
import { sumSellerCatalogLoyaltyPointsPerUnit } from "./sellerCatalogLoyaltyPoints.js";

/**
 * @param {string} sellerId
 * @param {unknown} rawPerUnit
 * @param {{ excludeProductId?: string | null }} [options]
 */
export const assertSellerCanSetProductLoyaltyPointsPerUnit = async (
  sellerId,
  rawPerUnit,
  options = {},
) => {
  const perUnit = normalizeProductLoyaltyPointsPerUnit(rawPerUnit);
  if (perUnit === 0) {
    return 0;
  }

  const { excludeProductId = null } = options;

  const seller = await UserModel.findById(sellerId)
    .select("userLoyaltyPoints userLoyaltyPointsReserved")
    .lean();

  if (!seller) {
    throw new Error("Продавец не найден");
  }

  const available = getSellerLoyaltyPointsAvailable(seller);
  const catalogCommitted = await sumSellerCatalogLoyaltyPointsPerUnit(
    sellerId,
    excludeProductId,
  );
  const maxPerUnit = Math.max(0, available - catalogCommitted);

  if (perUnit > maxPerUnit) {
    if (catalogCommitted > 0) {
      throw new Error(
        `Недостаточно баллов: для этого товара не больше ${maxPerUnit} (на других товарах уже закреплено ${catalogCommitted} за штуку)`,
      );
    }
    throw new Error(`Баллов за штуку не больше ${maxPerUnit} (доступно на счёте)`);
  }

  return perUnit;
};
