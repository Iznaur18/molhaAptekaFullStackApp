import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  CartModel,
  OrderModel,
  ProductModel,
  ProductPriceOfferModel,
  UserModel,
} from "../../models/index.js";
import { resolveAcceptedOfferForOrder } from "../../utils/productPriceOfferHelpers.js";
import { assertOrderItemsWithinAvailableStock } from "../../utils/productStock.js";
import { errorRes, successRes } from "../../utils/index.js";
import { checkUserEmailVerified } from "../../utils/assertEmailVerified.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { normalizeProductLoyaltyPointsPerUnit } from "../../utils/loyaltyPointsSeller.js";
import {
  buildOrderLineLoyaltySnapshot,
  reserveLoyaltyPointsForNewOrder,
} from "../../utils/orderLoyaltyPoints.js";

import { ORDER_BUYER_PUBLIC_FIELDS, ORDER_ITEMS_POPULATE } from "./orderQueries.js";
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

/** `POST /order` — создание заказа авторизованным пользователем. */
export const makeOrderController = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, paymentMethod, priceOfferId } = req.body;
    const verified = req.verifiedDeliveryAddress;

    const emailCheck = await checkUserEmailVerified(userId);
    if (!emailCheck.ok) {
      return errorRes(res, 403, emailCheck.message);
    }

    const uniqueProductIds = [...new Set(items.map((item) => String(item.productId)))];

    /** @type {Record<string, { price: number; name: string; loyaltyPointsPerUnit: number; sellerId: string }>} */
    let productById = {};
    let linkedPriceOfferId = null;

    if (priceOfferId) {
      if (items.length !== 1 || items[0].quantity !== 1) {
        return errorRes(
          res,
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
          return errorRes(res, 400, "Товар не найден");
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
      } catch (e) {
        return errorRes(
          res,
          400,
          e instanceof Error ? e.message : "Нельзя оформить заказ по предложению",
        );
      }
    } else {
      try {
        await assertOrderItemsWithinAvailableStock(items, userId);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Нельзя оформить заказ";
        return errorRes(res, 400, message);
      }

      productById = await fetchAvailableProductsForOrder(uniqueProductIds);
      if (Object.keys(productById).length !== uniqueProductIds.length) {
        return errorRes(
          res,
          400,
          "Один или несколько товаров не найдены или недоступны",
        );
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

    let order;
    try {
      order = await runInTransaction(async (session) => {
        await reserveLoyaltyPointsForNewOrder(itemsForReserve, session);

        const [created] = await OrderModel.create(
          [
            {
              userBuyerId: userId,
              items: itemsWithPrice,
              totalAmount,
              deliveryAddress: verified.displayAddress,
              deliveryAddressFlat: verified.flat,
              deliveryAddressFiasId: verified.fiasId,
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
          throw new Error("USER_NOT_FOUND");
        }

        await CartModel.findOneAndUpdate(
          { userId: new mongoose.Types.ObjectId(String(userId)) },
          { $set: { items: {} } },
          withMongoSession({ upsert: true }, session),
        );

        return created;
      });
    } catch (txError) {
      if (txError instanceof Error && txError.message === "USER_NOT_FOUND") {
        return errorRes(res, 404, "Пользователь не найден");
      }
      const message =
        txError instanceof Error ? txError.message : "Недостаточно баллов у продавца";
      return errorRes(res, 400, message);
    }

    await order.populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS);
    await order.populate(ORDER_ITEMS_POPULATE);

    return successRes(res, { message: "Заказ успешно создан", order });
  } catch (error) {
    console.error("makeOrderController error:", error);
    return errorRes(res, 500, "Ошибка при создании заказа");
  }
};
