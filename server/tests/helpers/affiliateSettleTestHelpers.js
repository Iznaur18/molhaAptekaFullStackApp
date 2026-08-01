import { ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY } from "../../constants/orderConstants.js";
import { ORDER_STATUS_DELIVERED } from "../../constants/orderConstants.js";
import { AFFILIATE_LINE_STATUS_PENDING } from "../../constants/affiliateConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { OrderModel, ProductModel, UserModel } from "../../models/index.js";
import { buildOrderLineLoyaltySnapshot } from "../../services/order/orderLoyaltyPoints.js";
import { reserveLoyaltyPointsForNewOrder } from "../../services/order/orderLoyaltyPoints.js";
import { buildOrderStatusFromItems } from "../../services/order/orderStatus.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

const TEST_SUFFIX = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Фикстура: продавец / покупатель / шарер / товар с партнёркой.
 *
 * @param {{
 *   sellerPoints?: number;
 *   affiliatePercent?: number;
 *   affiliateEnabled?: boolean;
 *   productPrice?: number;
 *   loyaltyPointsPerUnit?: number;
 * }} [options]
 */
export async function createAffiliateSettleFixture(options = {}) {
  const suffix = TEST_SUFFIX();
  const sellerPoints = options.sellerPoints ?? 500;
  const affiliatePercent = options.affiliatePercent ?? 10;
  const affiliateEnabled = options.affiliateEnabled !== false;
  const productPrice = options.productPrice ?? 1000;
  const loyaltyPointsPerUnit = options.loyaltyPointsPerUnit ?? 0;

  const seller = await UserModel.create({
    userName: `aff_seller_${suffix}`,
    email: `aff_seller_${suffix}@test.local`,
    passwordHash: "hash",
    userLoyaltyPoints: sellerPoints,
    userLoyaltyPointsReserved: 0,
  });

  const buyer = await UserModel.create({
    userName: `aff_buyer_${suffix}`,
    email: `aff_buyer_${suffix}@test.local`,
    passwordHash: "hash",
    userLoyaltyPoints: 0,
    isUserDataConfirmed: true,
  });

  const referrer = await UserModel.create({
    userName: `aff_ref_${suffix}`,
    email: `aff_ref_${suffix}@test.local`,
    passwordHash: "hash",
    userLoyaltyPoints: 0,
  });

  const product = await ProductModel.create({
    productName: `Aff product ${suffix}`,
    productDescription: "Affiliate settle test",
    productPrice,
    productSeller: seller._id,
    productCategory: "grocery",
    productStockQuantity: 10,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    loyaltyPointsPerUnit,
    affiliateEnabled,
    affiliatePercent,
    productPickupAddress: "Москва, Тверская улица, д 1",
    productPickupLat: 55.757,
    productPickupLon: 37.615,
    productDeliveryEnabled: false,
  });

  return { seller, buyer, referrer, product, affiliatePercent, productPrice };
}

/**
 * Заказ с резервом лояльности (если есть) + affiliate pending на линии.
 *
 * @param {{
 *   buyer: import("mongoose").Document;
 *   seller: import("mongoose").Document;
 *   product: import("mongoose").Document;
 *   referrerUserId: import("mongoose").Types.ObjectId | string | null;
 *   quantity?: number;
 *   affiliateStatus?: string;
 * }} params
 */
export async function createAffiliatePendingOrder({
  buyer,
  seller,
  product,
  referrerUserId,
  quantity = 1,
  affiliateStatus = AFFILIATE_LINE_STATUS_PENDING,
}) {
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
      affiliateReferrerUserId: referrerUserId || null,
      affiliateStatus: referrerUserId ? affiliateStatus : "none",
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
}

/**
 * @param {import("mongoose").Types.ObjectId | string} orderId
 * @param {number} itemIndex
 */
export async function markAffiliateOrderItemDelivered(orderId, itemIndex) {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }
  order.items[itemIndex].status = ORDER_STATUS_DELIVERED;
  order.status = buildOrderStatusFromItems(order.items);
  await order.save();
  return order;
}
