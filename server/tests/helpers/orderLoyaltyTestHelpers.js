import { ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY } from "../../constants/orderConstants.js";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
} from "../../constants/orderConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { OrderModel, ProductModel, UserModel } from "../../models/index.js";
import { ORDER_ITEMS_POPULATE } from "../../services/order/orderQueries.js";
import { buildOrderStatusFromItems } from "../../services/order/orderStatus.js";
import { prepareLoyaltyPointsForConfirmedOrderItem } from "../../services/order/loyaltyPoints.js";
import {
  buildOrderLineLoyaltySnapshot,
  markOrderLineLoyaltyReserveReleased,
  releaseUnawardedLoyaltyReservesForOrder,
  reserveLoyaltyPointsForNewOrder,
} from "../../services/order/orderLoyaltyPoints.js";
import { settleLoyaltyPointsReservation } from "../../services/loyalty/loyaltyPointsReserve.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

const TEST_SUFFIX = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * @param {{
 *   sellerPoints?: number;
 *   sellerReserved?: number;
 *   buyerDataConfirmed?: boolean;
 *   loyaltyPointsPerUnit?: number;
 * }} [options]
 */
export const createOrderLoyaltyFixture = async (options = {}) => {
  const suffix = TEST_SUFFIX();
  const sellerPoints = options.sellerPoints ?? 200;
  const loyaltyPointsPerUnit = options.loyaltyPointsPerUnit ?? 20;

  const seller = await UserModel.create({
    userName: `seller_${suffix}`,
    email: `seller_${suffix}@test.local`,
    passwordHash: "hash",
    userLoyaltyPoints: sellerPoints,
    userLoyaltyPointsReserved: options.sellerReserved ?? 0,
  });

  const buyer = await UserModel.create({
    userName: `buyer_${suffix}`,
    email: `buyer_${suffix}@test.local`,
    passwordHash: "hash",
    userLoyaltyPoints: 0,
    isUserDataConfirmed: options.buyerDataConfirmed !== false,
  });

  const product = await ProductModel.create({
    productName: `Product ${suffix}`,
    productDescription: "Test product description",
    productPrice: 1000,
    productSeller: seller._id,
    productCategory: "grocery",
    productStockQuantity: 10,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    loyaltyPointsPerUnit,
    productPickupAddress: "Москва, Тверская улица, д 1",
    productPickupLat: 55.757,
    productPickupLon: 37.615,
    productDeliveryEnabled: false,
  });

  return { seller, buyer, product, loyaltyPointsPerUnit };
};

/**
 * @param {{
 *   buyer: import('mongoose').Document;
 *   seller: import('mongoose').Document;
 *   product: import('mongoose').Document;
 *   quantity?: number;
 * }} params
 */
export const createOrderWithReserveTransaction = async ({
  buyer,
  seller,
  product,
  quantity = 1,
}) => {
  const loyaltyLine = buildOrderLineLoyaltySnapshot({
    loyaltyPointsPerUnit: product.loyaltyPointsPerUnit,
    quantity,
  });
  const orderItems = [
    {
      productId: product._id,
      quantity,
      unitPriceAtOrder: product.productPrice,
      productNameAtOrder: product.productName,
      ...loyaltyLine,
    },
  ];
  const itemsForReserve = [
    {
      ...orderItems[0],
      productId: { productSeller: seller._id },
    },
  ];

  return runInTransaction(async (session) => {
    await reserveLoyaltyPointsForNewOrder(itemsForReserve, session);

    const [order] = await OrderModel.create(
      [
        {
          userBuyerId: buyer._id,
          items: orderItems,
          totalAmount: product.productPrice * quantity,
          deliveryAddress: "Test delivery address",
          deliveryAddressFlat: "1",
          paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
        },
      ],
      withMongoSession({}, session),
    );

    return order;
  });
};

/**
 * @param {import('mongoose').Types.ObjectId | string} orderId
 * @param {number} itemIndex
 */
export const markOrderItemDelivered = async (orderId, itemIndex) => {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }
  order.items[itemIndex].status = ORDER_STATUS_DELIVERED;
  order.status = buildOrderStatusFromItems(order.items);
  await order.save();
  return order;
};

/**
 * Логика confirm из updateOrderItemStatusController (loyalty + save).
 *
 * @param {{
 *   orderId: import('mongoose').Types.ObjectId | string;
 *   itemIndex: number;
 *   buyerId: import('mongoose').Types.ObjectId | string;
 *   isUserDataConfirmed?: boolean;
 * }} params
 * @returns {Promise<number>} pointsEarned
 */
export const confirmOrderItemLoyaltyTransaction = async ({
  orderId,
  itemIndex,
  buyerId,
  isUserDataConfirmed = true,
}) => {
  const order = await OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const targetItem = order.items[itemIndex];
  if (!targetItem) {
    throw new Error("ITEM_NOT_FOUND");
  }

  if (targetItem.status !== ORDER_STATUS_DELIVERED) {
    const error = new Error("CONFIRM_WRONG_STATUS");
    error.code = "CONFIRM_WRONG_STATUS";
    throw error;
  }

  if (targetItem.loyaltyPointsAwarded) {
    return Number(targetItem.loyaltyPointsEarned) || 0;
  }

  const itemSellerId = String(
    targetItem.productId?.productSeller?._id ?? targetItem.productId?.productSeller,
  );
  const reservedTotal = Math.ceil(Number(targetItem.loyaltyPointsReservedTotal) || 0);

  return runInTransaction(async (session) => {
    const earned = prepareLoyaltyPointsForConfirmedOrderItem({
      order,
      itemIndex,
      isUserDataConfirmed,
    });

    if (earned > 0) {
      await settleLoyaltyPointsReservation({
        sellerId: itemSellerId,
        buyerId: String(buyerId),
        amount: earned,
        session,
      });
      markOrderLineLoyaltyReserveReleased(targetItem);
    } else if (
      reservedTotal > 0 &&
      !targetItem.loyaltyPointsReserveReleased &&
      itemSellerId
    ) {
      await releaseUnawardedLoyaltyReservesForOrder(
        [
          {
            ...(targetItem.toObject?.() ?? targetItem),
            productId: targetItem.productId,
          },
        ],
        session,
      );
      markOrderLineLoyaltyReserveReleased(targetItem);
    }

    targetItem.status = ORDER_STATUS_CONFIRMED;
    targetItem.confirmedAt = new Date();
    targetItem.confirmedBy = buyerId;
    order.status = buildOrderStatusFromItems(order.items);
    await order.save({ session });

    return earned;
  });
};

/**
 * @param {{
 *   orderId: import('mongoose').Types.ObjectId | string;
 *   itemIndex: number;
 * }} params
 */
export const cancelOrderItemLoyaltyTransaction = async ({ orderId, itemIndex }) => {
  const order = await OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const targetItem = order.items[itemIndex];
  if (!targetItem) {
    throw new Error("ITEM_NOT_FOUND");
  }

  const releaseLine = {
    ...(targetItem.toObject?.() ?? targetItem),
    productId: targetItem.productId,
  };

  await runInTransaction(async (session) => {
    targetItem.status = ORDER_STATUS_CANCELLED;
    markOrderLineLoyaltyReserveReleased(targetItem);
    order.status = buildOrderStatusFromItems(order.items);
    await order.save({ session });
    await releaseUnawardedLoyaltyReservesForOrder([releaseLine], session);
  });
};
