import { AppError } from "../../errors/AppError.js";
import { ProductModel } from "../../models/index.js";
import { attachProductSellerSnapshots } from "../product/attachProductSellerSnapshots.js";
import {
  assertProductCanJoinRaffle,
  recalculateRaffleSalesProgress,
} from "./raffleHelpers.js";

/**
 * @param {{
 *   sellerId: string;
 *   productId: string;
 *   enabled: boolean;
 * }} input
 */
export async function setProductRaffleParticipation({ sellerId, productId, enabled }) {
  if (!enabled) {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new AppError(404, "Товар не найден");
    }
    if (String(product.productSeller) !== sellerId) {
      throw new AppError(403, "Нет доступа");
    }

    const previousRaffleId = product.activeRaffleId;
    if (previousRaffleId) {
      await recalculateRaffleSalesProgress(previousRaffleId);
    }

    product.activeRaffleId = null;
    product.raffleParticipationEnabledAt = null;
    await product.save();

    const [payload] = await attachProductSellerSnapshots([product.toObject()]);
    return { product: payload };
  }

  const check = await assertProductCanJoinRaffle(productId, sellerId);
  if (!check.ok) {
    throw new AppError(409, check.message);
  }

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError(404, "Товар не найден");
  }

  product.activeRaffleId = check.raffle._id;
  product.raffleParticipationEnabledAt = new Date();
  await product.save();
  await recalculateRaffleSalesProgress(check.raffle._id);

  const [payload] = await attachProductSellerSnapshots([product.toObject()]);
  return { product: payload };
}
