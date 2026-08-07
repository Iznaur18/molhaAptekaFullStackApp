import mongoose from "mongoose";

import {
  ORDER_FULFILLMENT_PICKUP,
  PRODUCT_DELIVERY_NOT_ENABLED_FOR_ITEMS_MESSAGE,
  PRODUCT_PICKUP_MISSING_FOR_ORDER_MESSAGE,
  PRODUCT_PICKUP_NOT_ENABLED_FOR_ITEMS_MESSAGE,
} from "@molha/api-contract";
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
import {
  finalizeOffersAfterOrderConfirmed,
  resolveAcceptedOfferForOrder,
} from "../product/productPriceOfferHelpers.js";
import {
  assertOrderItemsWithinAvailableStock,
  guardOrderItemsStockInTransaction,
} from "../product/productStock.js";
import { resolveProductUnitPrice } from "@izibuy/shared-lib";

import { buildOrderStatusFromItems } from "./orderStatus.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  resolveAffiliateReferrerUserId,
  resolveOrderLineAffiliateAttribution,
} from "../affiliate/resolveAffiliateAttribution.js";

const calculateTotalAmount = (items) =>
  items.reduce((sum, item) => sum + (item.unitPriceAtOrder ?? 0) * item.quantity, 0);

/**
 * @param {Array<{ productId: unknown; quantity: number }>} items
 * @param {Record<string, {
 *   price: number;
 *   name: string;
 *   loyaltyPointsPerUnit: number;
 *   sellerId: string;
 *   pickupAddress: string;
 *   deliveryEnabled: boolean;
 *   affiliateEnabled: boolean;
 *   affiliatePercent: number;
 * }>} productById
 * @param {{ referrerUserId: string | null; buyerUserId: string }} affiliateCtx
 */
const buildItemsWithPriceSnapshot = (items, productById, affiliateCtx) =>
  items.map((item) => {
    const snapshot = productById[String(item.productId)];
    const unitPrice = resolveProductUnitPrice({
      productPrice: snapshot.price,
      productWholesaleEnabled: snapshot.wholesaleEnabled === true,
      productWholesaleMinQty: snapshot.wholesaleMinQty,
      productWholesalePrice: snapshot.wholesalePrice,
      quantity: item.quantity,
    });
    const loyalty = buildOrderLineLoyaltySnapshot({
      loyaltyPointsPerUnit: snapshot.loyaltyPointsPerUnit,
      quantity: item.quantity,
    });
    const affiliate = resolveOrderLineAffiliateAttribution({
      referrerUserId: affiliateCtx.referrerUserId,
      buyerUserId: affiliateCtx.buyerUserId,
      sellerUserId: snapshot.sellerId,
      affiliateEnabled: snapshot.affiliateEnabled === true,
      affiliatePercent: snapshot.affiliatePercent,
    });

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPriceAtOrder: unitPrice,
      productNameAtOrder: snapshot.name,
      ...loyalty,
      ...affiliate,
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
    .select(
      "_id productPrice productName loyaltyPointsPerUnit productSeller productPickupAddress productPickupEnabled productDeliveryEnabled productWholesaleEnabled productWholesaleMinQty productWholesalePrice affiliateEnabled affiliatePercent",
    )
    .lean();

  /** @type {Record<string, { price: number; name: string; loyaltyPointsPerUnit: number; sellerId: string; pickupAddress: string; pickupEnabled: boolean; deliveryEnabled: boolean; wholesaleEnabled: boolean; wholesaleMinQty: number | null; wholesalePrice: number | null; affiliateEnabled: boolean; affiliatePercent: number }>} */
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
      pickupAddress: String(product.productPickupAddress ?? "").trim(),
      pickupEnabled: product.productPickupEnabled !== false,
      deliveryEnabled: product.productDeliveryEnabled === true,
      wholesaleEnabled: product.productWholesaleEnabled === true,
      wholesaleMinQty: product.productWholesaleMinQty ?? null,
      wholesalePrice: product.productWholesalePrice ?? null,
      affiliateEnabled: product.affiliateEnabled === true,
      affiliatePercent: Math.floor(Number(product.affiliatePercent) || 0),
    };
  }
  return byId;
};

/**
 * @param {Record<string, { deliveryEnabled: boolean }>} productById
 * @param {string[]} productIds
 */
const assertProductsSupportDelivery = (productById, productIds) => {
  for (const id of productIds) {
    if (!productById[id]?.deliveryEnabled) {
      throw new AppError(400, PRODUCT_DELIVERY_NOT_ENABLED_FOR_ITEMS_MESSAGE);
    }
  }
};

/**
 * @param {Record<string, { pickupEnabled: boolean }>} productById
 * @param {string[]} productIds
 */
const assertProductsSupportPickup = (productById, productIds) => {
  for (const id of productIds) {
    if (productById[id]?.pickupEnabled === false) {
      throw new AppError(400, PRODUCT_PICKUP_NOT_ENABLED_FOR_ITEMS_MESSAGE);
    }
  }
};

/**
 * @param {Record<string, { pickupAddress: string }>} productById
 * @param {string[]} productIds
 */
const resolvePickupDeliveryAddress = (productById, productIds) => {
  const addresses = [];
  for (const id of productIds) {
    const address = productById[id]?.pickupAddress ?? "";
    if (!address) {
      throw new AppError(400, PRODUCT_PICKUP_MISSING_FOR_ORDER_MESSAGE);
    }
    if (!addresses.includes(address)) {
      addresses.push(address);
    }
  }
  return {
    displayAddress: addresses.join("; "),
    flat: "",
    fiasId: "",
  };
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
 *   fulfillmentMethod?: string;
 *   verifiedDeliveryAddress?: {
 *     displayAddress: string;
 *     flat?: string;
 *     fiasId: string;
 *   } | null;
 *   affiliateCode?: string | null;
 * }} input
 */
export async function createOrder({
  userId,
  items,
  paymentMethod,
  priceOfferId,
  fulfillmentMethod = ORDER_FULFILLMENT_PICKUP,
  verifiedDeliveryAddress = null,
  affiliateCode = null,
}) {
  const emailCheck = await checkUserEmailVerified(userId);
  if (!emailCheck.ok) {
    throw new AppError(403, emailCheck.message);
  }

  const uniqueProductIds = [...new Set(items.map((item) => String(item.productId)))];

  /** @type {Record<string, { price: number; name: string; loyaltyPointsPerUnit: number; sellerId: string; pickupAddress: string; deliveryEnabled: boolean }>} */
  let productById = {};
  let linkedPriceOfferId = null;

  if (priceOfferId) {
    if (items.length !== 1 || items[0].quantity !== 1) {
      throw new AppError(400, "Заказ по предложению цены — одна позиция, количество 1");
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
        .select(
          "loyaltyPointsPerUnit productSeller productPickupAddress productPickupEnabled productDeliveryEnabled affiliateEnabled affiliatePercent",
        )
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
        pickupAddress: String(product.productPickupAddress ?? "").trim(),
        pickupEnabled: product.productPickupEnabled !== false,
        deliveryEnabled: product.productDeliveryEnabled === true,
        wholesaleEnabled: false,
        wholesaleMinQty: null,
        wholesalePrice: null,
        affiliateEnabled: product.affiliateEnabled === true,
        affiliatePercent: Math.floor(Number(product.affiliatePercent) || 0),
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
      const message = error instanceof Error ? error.message : "Нельзя оформить заказ";
      throw new AppError(400, message);
    }

    productById = await fetchAvailableProductsForOrder(uniqueProductIds);
    if (Object.keys(productById).length !== uniqueProductIds.length) {
      throw new AppError(400, "Один или несколько товаров не найдены или недоступны");
    }
  }

  const resolvedFulfillment =
    fulfillmentMethod === "delivery" ? "delivery" : ORDER_FULFILLMENT_PICKUP;

  if (resolvedFulfillment === "delivery") {
    assertProductsSupportDelivery(productById, uniqueProductIds);
  } else {
    assertProductsSupportPickup(productById, uniqueProductIds);
  }

  const addressForOrder =
    resolvedFulfillment === ORDER_FULFILLMENT_PICKUP
      ? resolvePickupDeliveryAddress(productById, uniqueProductIds)
      : verifiedDeliveryAddress;

  if (!addressForOrder?.displayAddress) {
    throw new AppError(400, "Адрес доставки обязателен");
  }

  const referrerUserId = await resolveAffiliateReferrerUserId(affiliateCode);
  const itemsWithPrice = buildItemsWithPriceSnapshot(items, productById, {
    referrerUserId,
    buyerUserId: String(userId),
  });
  const totalAmount = calculateTotalAmount(itemsWithPrice);
  const status = buildOrderStatusFromItems(itemsWithPrice);

  const itemsForReserve = itemsWithPrice.map((line, index) => ({
    ...line,
    productId: {
      productSeller: productById[String(items[index].productId)]?.sellerId,
    },
  }));

  try {
    const created = await runInTransaction(async (session) => {
      await guardOrderItemsStockInTransaction(items, userId, session);
      await reserveLoyaltyPointsForNewOrder(itemsForReserve, session);

      const [createdOrder] = await OrderModel.create(
        [
          {
            userBuyerId: userId,
            items: itemsWithPrice,
            totalAmount,
            deliveryAddress: addressForOrder.displayAddress,
            deliveryAddressFlat: addressForOrder.flat ?? "",
            deliveryAddressFiasId: addressForOrder.fiasId ?? "",
            fulfillmentMethod: resolvedFulfillment,
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
          { $set: { orderId: createdOrder._id } },
          withMongoSession({}, session),
        );
      }

      const isUserUpdated = await appendOrderToBuyList(userId, createdOrder._id, session);
      if (!isUserUpdated) {
        throw new AppError(404, "Пользователь не найден");
      }

      await CartModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(String(userId)) },
        { $set: { items: {} } },
        withMongoSession({ upsert: true }, session),
      );

      return createdOrder;
    });

    if (linkedPriceOfferId) {
      const productId = String(items[0].productId);
      try {
        await finalizeOffersAfterOrderConfirmed(productId, linkedPriceOfferId);
      } catch (finalizeError) {
        logServerEvent("error", {
          event: "finalizeoffersafterordercreate",
          error:
            finalizeError instanceof Error
              ? finalizeError.message
              : String(finalizeError),
        });
      }
    }

    return created;
  } catch (txError) {
    if (txError instanceof AppError) {
      throw txError;
    }
    const message =
      txError instanceof Error ? txError.message : "Недостаточно баллов у продавца";
    throw new AppError(400, message);
  }
}
