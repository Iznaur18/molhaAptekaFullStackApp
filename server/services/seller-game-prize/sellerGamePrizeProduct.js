import mongoose from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { ProductModel } from "../../models/index.js";

/**
 * Общий для «Коробок удачи» и «Колеса фортуны» приз-товар: продавец
 * указывает id своего товара, покупатель выигрывает 1 шт за 0 ₽.
 */

/**
 * Проверить, что все указанные товары-призы существуют и принадлежат
 * продавцу. Вызывается при сохранении конфига игры.
 *
 * @param {{ sellerId: string; productIds: Array<string | null | undefined> }} args
 * @returns {Promise<Map<string, string>>} productId → productName (для снимков)
 */
export async function assertPrizeProductsBelongToSeller({ sellerId, productIds }) {
  const uniqueIds = [
    ...new Set(
      (Array.isArray(productIds) ? productIds : [])
        .filter((id) => id != null && mongoose.isValidObjectId(id))
        .map(String),
    ),
  ];
  const nameById = new Map();
  if (uniqueIds.length === 0) {
    return nameById;
  }

  const products = await ProductModel.find({
    _id: { $in: uniqueIds.map((id) => new mongoose.Types.ObjectId(id)) },
  })
    .select("_id productName productSeller")
    .lean();

  for (const product of products) {
    nameById.set(String(product._id), product.productName);
  }
  for (const id of uniqueIds) {
    if (!nameById.has(id)) {
      throw new AppError(400, `Товар-приз не найден: ${id}`);
    }
  }
  const foreign = products.find(
    (product) => String(product.productSeller) !== String(sellerId),
  );
  if (foreign) {
    throw new AppError(
      400,
      `Товар «${foreign.productName}» не ваш — призом можно ставить только свои товары`,
    );
  }
  return nameById;
}

/**
 * Можно ли прямо сейчас выдать товар-приз покупателю (живой, в наличии).
 * Если нет — приз сгорает при оформлении заказа.
 *
 * @param {object | null | undefined} product
 * @returns {boolean}
 */
export function isPrizeProductPurchasable(product) {
  return Boolean(
    product &&
    product.productModerationStatus === PRODUCT_MODERATION_APPROVED &&
    product.productIsAvailable !== false &&
    product.productOutOfStock !== true &&
    Number(product.productStockQuantity) > 0,
  );
}

/**
 * Названия товаров-призов для снимков (спин/выигрыш). Неизвестные id
 * просто пропускаются — имя тогда null.
 *
 * @param {Array<string | null | undefined>} productIds
 * @returns {Promise<Map<string, string>>} productId → productName
 */
export async function resolvePrizeProductNames(productIds) {
  const uniqueIds = [
    ...new Set(
      (Array.isArray(productIds) ? productIds : [])
        .filter((id) => id != null && mongoose.isValidObjectId(id))
        .map(String),
    ),
  ];
  const nameById = new Map();
  if (uniqueIds.length === 0) {
    return nameById;
  }
  const products = await ProductModel.find({
    _id: { $in: uniqueIds.map((id) => new mongoose.Types.ObjectId(id)) },
  })
    .select("_id productName")
    .lean();
  for (const product of products) {
    nameById.set(String(product._id), product.productName);
  }
  return nameById;
}
