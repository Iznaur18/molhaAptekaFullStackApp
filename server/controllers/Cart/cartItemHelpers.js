import mongoose from "mongoose";

import {
  CART_LINE_ITEM_QUANTITY_MAX,
  CART_LINE_ITEM_QUANTITY_MIN,
  CART_MAX_DISTINCT_PRODUCTS,
} from "../../constants/cartConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { ProductModel } from "../../models/index.js";
import { getSellerIdsBlockingBuyer } from "../../services/user/userBlockHelpers.js";

/**
 * Приводит сырые данные из БД/тела к объекту productId -> quantity.
 * @param {unknown} raw
 * @returns {Record<string, number>}
 */
export const normalizeStoredCartItems = (raw) => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return Object.entries(raw).reduce((acc, [productId, quantity]) => {
    if (!mongoose.isValidObjectId(productId)) return acc;
    const q = Math.floor(Number(quantity));
    if (q < CART_LINE_ITEM_QUANTITY_MIN || q > CART_LINE_ITEM_QUANTITY_MAX) {
      return acc;
    }
    acc[String(productId)] = q;
    return acc;
  }, {});
};

/**
 * Нормализация входящего тела PUT: валидные id, количества, не более N позиций.
 * @param {unknown} raw
 * @returns {{ ok: true; items: Record<string, number> } | { ok: false; message: string }}
 */
export const parseReplaceCartBodyItems = (raw) => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, message: "items должен быть объектом" };
  }
  const entries = Object.entries(raw).filter(([k]) => mongoose.isValidObjectId(k));
  if (entries.length > CART_MAX_DISTINCT_PRODUCTS) {
    return {
      ok: false,
      message: `Не более ${CART_MAX_DISTINCT_PRODUCTS} разных товаров в корзине`,
    };
  }
  const items = {};
  for (const [productId, quantity] of entries) {
    const q = Math.floor(Number(quantity));
    if (q < CART_LINE_ITEM_QUANTITY_MIN || q > CART_LINE_ITEM_QUANTITY_MAX) {
      return {
        ok: false,
        message: `Количество по каждой позиции от ${CART_LINE_ITEM_QUANTITY_MIN} до ${CART_LINE_ITEM_QUANTITY_MAX}`,
      };
    }
    items[String(productId)] = q;
  }
  return { ok: true, items };
};

/**
 * Оставляет только существующие и доступные к покупке товары.
 * @param {Record<string, number>} items
 * @param {string | null | undefined} [buyerUserId]
 * @returns {Promise<Record<string, number>>}
 */
export const filterCartItemsToPurchasableProducts = async (items, buyerUserId = null) => {
  const ids = Object.keys(items);
  if (ids.length === 0) return {};

  const oids = ids.map((id) => new mongoose.Types.ObjectId(id));
  const alive = await ProductModel.find({
    _id: { $in: oids },
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
    productOutOfStock: { $ne: true },
    productStockQuantity: { $gt: 0 },
  })
    .select("_id productSeller")
    .lean();

  let allowedProducts = alive;
  if (buyerUserId) {
    const sellerIds = alive.map((product) => String(product.productSeller));
    const blockingSellerIds = await getSellerIdsBlockingBuyer(buyerUserId, sellerIds);
    allowedProducts = alive.filter(
      (product) => !blockingSellerIds.has(String(product.productSeller)),
    );
  }

  const allowed = new Set(allowedProducts.map((p) => String(p._id)));
  return Object.fromEntries(
    Object.entries(items).filter(([productId]) => allowed.has(productId)),
  );
};
