import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import {
  CartModel,
  OrderModel,
  ProductModel,
  ProductPriceOfferModel,
  UserModel,
} from "../../models/index.js";
import { checkUserEmailVerified } from "../auth/assertEmailVerified.js";
import { normalizeProductLoyaltyPointsPerUnit } from "../loyalty/loyaltyPointsSeller.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import {
  buildOrderLineLoyaltySnapshot,
  reserveLoyaltyPointsForNewOrder,
} from "./orderLoyaltyPoints.js";
import { resolveAcceptedOfferForOrder } from "../product/productPriceOfferHelpers.js";
import {
  assertOrderItemsWithinAvailableStock,
  guardOrderItemsStockInTransaction,
} from "../product/productStock.js";

import { buildOrderStatusFromItems } from "./orderStatus.js";

const calculateTotalAmount = (items, priceById) =>
  items.reduce((sum, item) => {
    const price = priceById[String(item.productId)];
    return sum + (price ?? 0) * item.quantity;
  }, 0);

/**
 * @param {Array<{ productId: unknown; quantity: number }>} items
 * @param {Record<string, {
 *   price: number;
 *   name: string;
 *   loyaltyPointsPerUnit: number;
 *   sellerId: string;
 * }>} productById
 */
const buildItemsWithPriceSnapshot = (items, productById) =>
  items.map((item) => {
    const snapshot = productById[String(item.productId)];
    const loyalty = buildOrderLineLoyaltySnapshot({
      loyaltyPointsPerUnit: snapshot.loyaltyPointsPerUnit,
      quantity: item.quantity,
    });

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPriceAtOrder: snapshot.price,
      productNameAtOrder: snapshot.name,
      ...loyalty,
    };
  });

/**
 * @param {string[]} productIds
 */
const fetchAvailableProductsForOrder = async (productIds) => {
  const products = await ProductModel.find({
    _id: { $in: productIds },
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
    productStockQuantity: { $gt: 0 },
  })
    .select("_id productPrice productName loyaltyPointsPerUnit productSeller")
    .lean();

  /** @type {Record<string, { price: number; name: string; loyaltyPointsPerUnit: number; sellerId: string }>} */
  const byId = {};
  for (const product of products) {
    const id = String(product._id);
    const name = String(product.productName ?? "").trim();
    byId[id] = {
      price: product.productPrice,
      name: name.length > 0 ? name : "Товар без названия",
      loyaltyPointsPerUnit: normalizeProductLoyaltyPointsPerUnit(
        product.loyaltyPointsPerUnit,
      ),
      sellerId: String(product.productSeller),
    };
  }
  return byId;
};

const appendOrderToBuyList = async (userId, orderId, session) => {
  const user = await UserModel.findById(userId).session(session);
  if (!user) return false;

  const safeBuyList = Array.isArray(user.buyList)
    ? user.buyList.filter((id) => mongoose.isValidObjectId(id))
    : [];

  user.buyList = [...safeBuyList, orderId];
  await user.save({ validateBeforeSave: false, session });
  return true;
};

/**
 * @param {{
 *   userId: string;
 *   items: Array<{ productId: unknown; quantity: number }>;
 *   paymentMethod: string;
 *   priceOfferId?: string | null;
 *   verifiedDeliveryAddress: {
 *     displayAddress: string;
 *     flat?: string;
 *     fiasId: string;
 *   };
 * }} input
 */
export async function createOrder({
  userId,
  items,
  paymentMethod,
  priceOfferId,
  verifiedDeliveryAddress,
}) {
  const emailCheck = await checkUserEmailVerified(userId);
  if (!emailCheck.ok) {
    throw new AppError(403, emailCheck.message);
  }

  const uniqueProductIds = [...new Set(items.map((item) => String(item.productId)))];

  /** @type {Record<string, { price: number; name: string; loyaltyPointsPerUnit: number; sellerId: string }>} */
  let productById = {};
  let linkedPriceOfferId = null;

  if (priceOfferId) {
    if (items.length !== 1 || items[0].quantity !== 1) {
      throw new AppError(
        400,
        "Заказ по предложению цены — одна позиция, количество 1",
      );
    }

    const productId = String(items[0].productId);

    try {
      await assertOrderItemsWithinAvailableStock(items, userId);
      const resolved = await resolveAcceptedOfferForOrder(
        priceOfferId,
        userId,
        productId,
      );
      const product = await ProductModel.findById(productId)
        .select("loyaltyPointsPerUnit productSeller")
        .lean();
      if (!product) {
        throw new AppError(400, "Товар не найден");
      }
      productById[productId] = {
        price: resolved.price,
        name: resolved.name,
        loyaltyPointsPerUnit: normalizeProductLoyaltyPointsPerUnit(
          product.loyaltyPointsPerUnit,
        ),
        sellerId: String(product.productSeller),
      };
      linkedPriceOfferId = priceOfferId;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Нельзя оформить заказ по предложению";
      throw new AppError(400, message);
    }
  } else {
    try {
      await assertOrderItemsWithinAvailableStock(items, userId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Нельзя оформить заказ";
      throw new AppError(400, message);
    }

    productById = await fetchAvailableProductsForOrder(uniqueProductIds);
    if (Object.keys(productById).length !== uniqueProductIds.length) {
      throw new AppError(400, "Один или несколько товаров не найдены или недоступны");
    }
  }

  const itemsWithPrice = buildItemsWithPriceSnapshot(items, productById);
  const priceById = Object.fromEntries(
    Object.entries(productById).map(([id, row]) => [id, row.price]),
  );
  const totalAmount = calculateTotalAmount(itemsWithPrice, priceById);
  const status = buildOrderStatusFromItems(itemsWithPrice);

  const itemsForReserve = itemsWithPrice.map((line, index) => ({
    ...line,
    productId: {
      productSeller: productById[String(items[index].productId)]?.sellerId,
    },
  }));

  try {
    return await runInTransaction(async (session) => {
      // Авторитетная проверка остатка внутри транзакции (закрывает гонку оверселла).
      await guardOrderItemsStockInTransaction(items, userId, session);
      await reserveLoyaltyPointsForNewOrder(itemsForReserve, session);

      const [created] = await OrderModel.create(
        [
          {
            userBuyerId: userId,
            items: itemsWithPrice,
            totalAmount,
            deliveryAddress: verifiedDeliveryAddress.displayAddress,
            deliveryAddressFlat: verifiedDeliveryAddress.flat ?? "",
            deliveryAddressFiasId: verifiedDeliveryAddress.fiasId,
            paymentMethod,
            status,
            priceOfferId: linkedPriceOfferId,
          },
        ],
        withMongoSession({}, session),
      );

      if (linkedPriceOfferId) {
        await ProductPriceOfferModel.findByIdAndUpdate(
          linkedPriceOfferId,
          { $set: { orderId: created._id } },
          withMongoSession({}, session),
        );
      }

      const isUserUpdated = await appendOrderToBuyList(userId, created._id, session);
      if (!isUserUpdated) {
        throw new AppError(404, "Пользователь не найден");
      }

      await CartModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(String(userId)) },
        { $set: { items: {} } },
        withMongoSession({ upsert: true }, session),
      );

      return created;
    });
  } catch (txError) {
    if (txError instanceof AppError) {
      throw txError;
    }
    const message =
      txError instanceof Error ? txError.message : "Недостаточно баллов у продавца";
    throw new AppError(400, message);
  }
}
