import mongoose from "mongoose";

import {
  ORDER_FULFILLMENT_PICKUP,
  PRODUCT_DELIVERY_NOT_ENABLED_FOR_ITEMS_MESSAGE,
  PRODUCT_PICKUP_MISSING_FOR_ORDER_MESSAGE,
  PRODUCT_PICKUP_NOT_ENABLED_FOR_ITEMS_MESSAGE,
} from "@molha/api-contract";
import { buildStoredShipments } from "./orderShipments.js";
import { resolveOrderFulfillmentSplit } from "./resolveOrderFulfillmentSplit.js";
import { resolveDeliveryFeesBySeller } from "../courier/courierDeliveryFee.js";
import {
  COURIER_DELIVERY_CASH_FORBIDDEN_MESSAGE,
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  SELLER_PAYOUT_REQUISITES_REQUIRED_MESSAGE,
} from "../../constants/orderConstants.js";
import { USER_BLOCK_CART_ORDER_MESSAGE } from "../../constants/userBlockConstants.js";
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
import {
  resolveProductUnitPriceWithPromo,
  resolveBuyNFreeLineTotal,
  isProductBuyNFreeActive,
} from "@izibuy/shared-lib";
import { resolveSelectedProductPickupLocation } from "../product/productPickupLocations.js";

import { buildOrderStatusFromItems } from "./orderStatus.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { notifySellersAboutNewOrder } from "./notifySellersAboutNewOrder.js";
import { logMoneyEvent, logMoneyFailure } from "../loyalty/logMoneyEvent.js";
import {
  resolveAffiliateReferrerUserId,
  resolveOrderLineAffiliateAttribution,
} from "../affiliate/resolveAffiliateAttribution.js";
import {
  collectOrderedProductIdsWithPromo,
  consumeProductPromoActivationsForUser,
  listAppliedProductPromosForUser,
} from "../product/productPromoCode.js";
import { claimBuyNFreeRedemption } from "../product/productBuyNFreeProgress.js";
import { getSellerIdsBlockingBuyer } from "../user/userBlockHelpers.js";
import { isUserSellerClosedNow } from "@molha/api-contract";
import { USER_SELLER_CLOSED_ORDER_MESSAGE } from "../../constants/userBusinessHoursConstants.js";

const calculateTotalAmount = (items) =>
  items.reduce(
    (sum, item) =>
      sum +
      resolveBuyNFreeLineTotal({
        unitPrice: item.unitPriceAtOrder ?? 0,
        quantity: item.quantity,
        freeUnits: item.buyNFreeUnitsAtOrder ?? 0,
      }),
    0,
  );

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
 *   buyNFreeEnabled?: boolean;
 *   buyNFreeThreshold?: number | null;
 * }>} productById
 * @param {{ referrerUserId: string | null; buyerUserId: string }} affiliateCtx
 * @param {Record<string, { code: string; discountPercent: number }>} promoByProductId
 * @param {Record<string, number>} freeUnitsByProductId
 */
const buildItemsWithPriceSnapshot = (
  items,
  productById,
  affiliateCtx,
  promoByProductId = {},
  freeUnitsByProductId = {},
  pickupByProductId = null,
) => {
  /**
   * Бесплатные единицы — РАСХОДУЕМЫЙ бюджет на товар, а не флаг на строку.
   * Раньше каждая строка читала мапу заново, и заказ с двумя строками одного
   * productId получал две бесплатные единицы на один claim (totalAmount = 0).
   * @type {Record<string, number>}
   */
  const freeUnitsBudget = { ...freeUnitsByProductId };

  return items.map((item) => {
    const productKey = String(item.productId);
    const snapshot = productById[productKey];
    const promo = promoByProductId[productKey] ?? null;
    const unitPrice = resolveProductUnitPriceWithPromo({
      productPrice: snapshot.price,
      productWholesaleEnabled: snapshot.wholesaleEnabled === true,
      productWholesaleMinQty: snapshot.wholesaleMinQty,
      productWholesalePrice: snapshot.wholesalePrice,
      quantity: item.quantity,
      promoDiscountPercent: promo?.discountPercent ?? null,
    });
    const availableFreeUnits = Math.max(
      0,
      Math.floor(Number(freeUnitsBudget[productKey] ?? 0) || 0),
    );
    const freeUnits = Math.min(availableFreeUnits, 1, item.quantity);
    freeUnitsBudget[productKey] = availableFreeUnits - freeUnits;
    const paidQuantity = Math.max(0, item.quantity - freeUnits);
    const loyalty = buildOrderLineLoyaltySnapshot({
      loyaltyPointsPerUnit: snapshot.loyaltyPointsPerUnit,
      quantity: paidQuantity,
    });
    const affiliate = resolveOrderLineAffiliateAttribution({
      referrerUserId: affiliateCtx.referrerUserId,
      buyerUserId: affiliateCtx.buyerUserId,
      sellerUserId: snapshot.sellerId,
      affiliateEnabled: snapshot.affiliateEnabled === true,
      affiliatePercent: snapshot.affiliatePercent,
    });
    const pickup = pickupByProductId?.[productKey] ?? null;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPriceAtOrder: unitPrice,
      buyNFreeUnitsAtOrder: freeUnits,
      buyNFreeProgressApplied: false,
      buyNFreeProgressAction: null,
      buyNFreeProgressCountBefore: 0,
      productNameAtOrder: snapshot.name,
      sellerIdAtOrder: snapshot.sellerId ?? null,
      promoCodeAtOrder: promo?.code ?? null,
      promoDiscountPercentAtOrder: promo?.discountPercent ?? null,
      pickupLocationIdAtOrder: pickup?.id ?? null,
      pickupAddressAtOrder: pickup?.address ?? null,
      pickupLatAtOrder: pickup?.lat ?? null,
      pickupLonAtOrder: pickup?.lon ?? null,
      ...loyalty,
      ...affiliate,
    };
  });
};

/**
 * @param {string[]} productIds
 */
const fetchAvailableProductsForOrder = async (productIds) => {
  const products = await ProductModel.find({
    _id: { $in: productIds },
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
    productOutOfStock: { $ne: true },
    productStockQuantity: { $gt: 0 },
  })
    .select(
      "_id productPrice productName loyaltyPointsPerUnit productSeller productPickupAddress productPickupLat productPickupLon productPickupLocations productPickupEnabled productDeliveryEnabled productCourierDeliveryEnabled productWholesaleEnabled productWholesaleMinQty productWholesalePrice affiliateEnabled affiliatePercent productBuyNFreeEnabled productBuyNFreeThreshold",
    )
    .lean();

  /** @type {Record<string, object>} */
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
      productPickupAddress: product.productPickupAddress,
      productPickupLat: product.productPickupLat,
      productPickupLon: product.productPickupLon,
      productPickupLocations: product.productPickupLocations,
      pickupEnabled: product.productPickupEnabled !== false,
      deliveryEnabled: product.productDeliveryEnabled === true,
      courierDeliveryEnabled: product.productCourierDeliveryEnabled === true,
      wholesaleEnabled: product.productWholesaleEnabled === true,
      wholesaleMinQty: product.productWholesaleMinQty ?? null,
      wholesalePrice: product.productWholesalePrice ?? null,
      affiliateEnabled: product.affiliateEnabled === true,
      affiliatePercent: Math.floor(Number(product.affiliatePercent) || 0),
      buyNFreeEnabled: product.productBuyNFreeEnabled === true,
      buyNFreeThreshold: product.productBuyNFreeThreshold ?? null,
    };
  }
  return byId;
};

/**
 * @param {string} buyerUserId
 * @param {Record<string, { sellerId: string }>} productById
 */
const assertBuyerNotBlockedForProducts = async (buyerUserId, productById) => {
  const sellerIds = Object.values(productById).map((snapshot) => snapshot.sellerId);
  const blockingSellerIds = await getSellerIdsBlockingBuyer(buyerUserId, sellerIds);
  if (blockingSellerIds.size > 0) {
    throw new AppError(403, USER_BLOCK_CART_ORDER_MESSAGE);
  }
};

/**
 * @param {Record<string, { sellerId: string }>} productById
 */
const assertSellersOpenForProducts = async (productById) => {
  const sellerIds = [...new Set(Object.values(productById).map((snapshot) => snapshot.sellerId))];
  if (sellerIds.length === 0) {
    return;
  }

  const sellers = await UserModel.find({ _id: { $in: sellerIds } })
    .select("userBusinessHoursEnabled userBusinessHours userRegionCode")
    .lean();

  for (const seller of sellers) {
    if (isUserSellerClosedNow(seller)) {
      throw new AppError(403, USER_SELLER_CLOSED_ORDER_MESSAGE);
    }
  }
};

/**
 * @param {Record<string, { deliveryEnabled: boolean }>} productById
 * @param {string[]} productIds
 */

/**
 * Реквизиты продавца при курьерской доставке обязательны: покупатель стоит
 * у двери и должен куда-то перевести. При самовывозе люди встречаются лично,
 * и вопрос не возникает.
 *
 * @param {string[]} sellerIds
 */
const assertSellersHavePayoutRequisites = async (sellerIds) => {
  const sellers = await UserModel.find({ _id: { $in: sellerIds } })
    .select("sellerPayoutRequisites")
    .lean();

  /** @type {Record<string, string>} */
  const bySeller = {};
  for (const seller of sellers) {
    bySeller[String(seller._id)] = String(seller?.sellerPayoutRequisites ?? "").trim();
  }

  const missing = sellerIds.some((id) => !bySeller[id]);
  if (missing) {
    throw new AppError(400, SELLER_PAYOUT_REQUISITES_REQUIRED_MESSAGE);
  }
  return bySeller;
};

const assertProductsSupportDelivery = (productById, productIds) => {
  for (const id of productIds) {
    const snapshot = productById[id];
    if (!snapshot?.deliveryEnabled && !snapshot?.courierDeliveryEnabled) {
      throw new AppError(400, PRODUCT_DELIVERY_NOT_ENABLED_FOR_ITEMS_MESSAGE);
    }
  }
};

/**
 * Кто везёт отправление продавца: свободный курьер или он сам.
 *
 * Флаги на товаре взаимоисключающие, но у одного продавца могут быть товары
 * обоих видов. Смешивать их в одном отправлении нельзя: непонятно, кому его
 * предлагать.
 *
 * @param {Record<string, { sellerId?: string; courierDeliveryEnabled?: boolean }>} productById
 * @param {string[]} deliveryProductIds
 * @returns {Record<string, boolean>}
 */
const resolveCourierDeliveryBySeller = (productById, deliveryProductIds) => {
  /** @type {Record<string, boolean>} */
  const bySeller = {};
  for (const id of deliveryProductIds) {
    const snapshot = productById[id];
    const sellerId = String(snapshot?.sellerId ?? "");
    if (!sellerId) continue;
    const byCourier = snapshot?.courierDeliveryEnabled === true;
    if (sellerId in bySeller && bySeller[sellerId] !== byCourier) {
      throw new AppError(
        400,
        "У одного продавца нельзя смешивать доставку продавцом и курьерами Gitorg",
      );
    }
    bySeller[sellerId] = byCourier;
  }
  return bySeller;
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
 * @param {Record<string, object>} productById
 * @param {string[]} productIds
 * @param {Array<{ productId?: unknown; pickupLocationId?: string }> | null | undefined} pickupSelections
 */
const resolvePickupSelectionsByProductId = (
  productById,
  productIds,
  pickupSelections,
) => {
  /** @type {Map<string, string>} */
  const selectedIdByProduct = new Map();
  for (const row of Array.isArray(pickupSelections) ? pickupSelections : []) {
    const productId = String(row?.productId ?? "").trim();
    const locationId = String(row?.pickupLocationId ?? "").trim();
    if (productId && locationId) {
      selectedIdByProduct.set(productId, locationId);
    }
  }

  /** @type {Record<string, { id: string; address: string; lat: number | null; lon: number | null }>} */
  const pickupByProductId = {};
  const addresses = [];

  for (const id of productIds) {
    const selected = resolveSelectedProductPickupLocation(
      productById[id],
      selectedIdByProduct.get(id) ?? null,
    );
    const address = String(selected.address ?? "").trim();
    if (!address) {
      throw new AppError(400, PRODUCT_PICKUP_MISSING_FOR_ORDER_MESSAGE);
    }
    pickupByProductId[id] = {
      id: selected.id,
      address,
      lat: selected.lat,
      lon: selected.lon,
    };
    if (!addresses.includes(address)) {
      addresses.push(address);
    }
  }

  return {
    pickupByProductId,
    addressForOrder: {
      displayAddress: addresses.join("; "),
      flat: "",
      fiasId: "",
    },
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
 *   pickupSelections?: Array<{ productId: unknown; pickupLocationId: string }> | null;
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
  fulfillmentBySellerId = null,
  deliveryFeeBySellerId = null,
  pickupSelections = [],
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
          "loyaltyPointsPerUnit productSeller productPickupAddress productPickupLat productPickupLon productPickupLocations productPickupEnabled productDeliveryEnabled productCourierDeliveryEnabled affiliateEnabled affiliatePercent productBuyNFreeEnabled productBuyNFreeThreshold",
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
        productPickupAddress: product.productPickupAddress,
        productPickupLat: product.productPickupLat,
        productPickupLon: product.productPickupLon,
        productPickupLocations: product.productPickupLocations,
        pickupEnabled: product.productPickupEnabled !== false,
        deliveryEnabled: product.productDeliveryEnabled === true,
      courierDeliveryEnabled: product.productCourierDeliveryEnabled === true,
        wholesaleEnabled: false,
        wholesaleMinQty: null,
        wholesalePrice: null,
        affiliateEnabled: product.affiliateEnabled === true,
        affiliatePercent: Math.floor(Number(product.affiliatePercent) || 0),
        buyNFreeEnabled: product.productBuyNFreeEnabled === true,
        buyNFreeThreshold: product.productBuyNFreeThreshold ?? null,
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

  await assertBuyerNotBlockedForProducts(String(userId), productById);
  await assertSellersOpenForProducts(productById);

  const fulfillmentSplit = resolveOrderFulfillmentSplit({
    productIds: uniqueProductIds,
    productById,
    fulfillmentBySellerId,
    fallbackFulfillment:
      fulfillmentMethod === "delivery" ? "delivery" : ORDER_FULFILLMENT_PICKUP,
  });
  const resolvedFulfillment = fulfillmentSplit.orderFulfillmentMethod;

  // Проверяем каждую половину своим правилом: в смешанном заказе товар
  // самовывозного продавца не обязан поддерживать доставку, и наоборот.
  assertProductsSupportDelivery(productById, fulfillmentSplit.deliveryProductIds);
  const courierDeliveryBySeller = resolveCourierDeliveryBySeller(
    productById,
    fulfillmentSplit.deliveryProductIds,
  );

  /** @type {Record<string, string>} */
  let payoutRequisitesBySeller = {};
  const courierSellerIds = Object.entries(courierDeliveryBySeller)
    .filter(([, byCourier]) => byCourier)
    .map(([sellerId]) => sellerId);

  if (courierSellerIds.length > 0) {
    // Наличные у курьера означают, что продавец их не видит и подтвердить
    // оплату не может — третье рукопожатие рассыпается.
    if (paymentMethod === ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY) {
      throw new AppError(400, COURIER_DELIVERY_CASH_FORBIDDEN_MESSAGE);
    }
    payoutRequisitesBySeller = await assertSellersHavePayoutRequisites(courierSellerIds);
  }
  assertProductsSupportPickup(productById, fulfillmentSplit.pickupProductIds);

  /** @type {Record<string, { id: string; address: string; lat: number | null; lon: number | null }> | null} */
  let pickupByProductId = null;
  let addressForOrder = verifiedDeliveryAddress;

  if (fulfillmentSplit.hasPickup) {
    const resolvedPickup = resolvePickupSelectionsByProductId(
      productById,
      fulfillmentSplit.pickupProductIds,
      pickupSelections,
    );
    pickupByProductId = resolvedPickup.pickupByProductId;
    // Адрес заказа — покупательский, как только хоть что-то едет к нему.
    // Точки самовывоза при этом никуда не деваются: они лежат на позициях.
    if (!fulfillmentSplit.hasDelivery) {
      addressForOrder = resolvedPickup.addressForOrder;
    }
  }

  if (!addressForOrder?.displayAddress) {
    throw new AppError(400, "Адрес доставки обязателен");
  }

  const referrerUserId = await resolveAffiliateReferrerUserId(affiliateCode);
  const appliedPromos = await listAppliedProductPromosForUser({
    userId: String(userId),
    productIds: uniqueProductIds,
  });
  /** @type {Record<string, { code: string; discountPercent: number }>} */
  const promoByProductId = {};
  for (const row of appliedPromos) {
    promoByProductId[row.productId] = {
      code: row.code,
      discountPercent: row.discountPercent,
    };
  }

  try {
    const created = await runInTransaction(async (session) => {
      await guardOrderItemsStockInTransaction(items, userId, session);

      const orderId = new mongoose.Types.ObjectId();
      /** @type {Record<string, number>} */
      const freeUnitsByProductId = {};
      /** Claim на товар пробуем ровно один раз, даже если строк с ним несколько. */
      const claimAttemptedProductIds = new Set();
      for (const item of items) {
        const productId = String(item.productId);
        if (claimAttemptedProductIds.has(productId)) {
          continue;
        }
        claimAttemptedProductIds.add(productId);
        const snapshot = productById[productId];
        if (
          !isProductBuyNFreeActive({
            productBuyNFreeEnabled: snapshot?.buyNFreeEnabled === true,
            productBuyNFreeThreshold: snapshot?.buyNFreeThreshold,
          })
        ) {
          continue;
        }
        const qty = Math.floor(Number(item.quantity) || 0);
        if (qty < 1) {
          continue;
        }
        const claimed = await claimBuyNFreeRedemption({
          buyerId: userId,
          productId,
          threshold: snapshot.buyNFreeThreshold,
          orderId,
          session,
        });
        if (claimed) {
          freeUnitsByProductId[productId] = 1;
        }
      }

      const pricedItems = buildItemsWithPriceSnapshot(
        items,
        productById,
        {
          referrerUserId,
          buyerUserId: String(userId),
        },
        promoByProductId,
        freeUnitsByProductId,
        // Мапа уже содержит только самовывозные товары — доставочные позиции
        // точку получения не получат даже в смешанном заказе.
        pickupByProductId,
      );
      const totalAmount = calculateTotalAmount(pricedItems);
      const orderStatus = buildOrderStatusFromItems(pricedItems);
      const reserveLines = pricedItems.map((line, index) => ({
        ...line,
        productId: {
          productSeller: productById[String(items[index].productId)]?.sellerId,
        },
      }));
      await reserveLoyaltyPointsForNewOrder(reserveLines, session);

      const [createdOrder] = await OrderModel.create(
        [
          {
            _id: orderId,
            userBuyerId: userId,
            items: pricedItems,
            totalAmount,
            deliveryAddress: addressForOrder.displayAddress,
            deliveryAddressFlat: addressForOrder.flat ?? "",
            deliveryAddressFiasId: addressForOrder.fiasId ?? "",
            fulfillmentMethod: resolvedFulfillment,
            shipments: buildStoredShipments(
              pricedItems,
              fulfillmentSplit.fulfillmentBySellerId,
              resolvedFulfillment,
              resolveDeliveryFeesBySeller({
                fulfillmentBySellerId: fulfillmentSplit.fulfillmentBySellerId,
                feeBySellerId: deliveryFeeBySellerId,
              }),
              courierDeliveryBySeller,
              payoutRequisitesBySeller,
            ),
            paymentMethod,
            status: orderStatus,
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

      const isUserUpdated = await appendOrderToBuyList(
        userId,
        createdOrder._id,
        session,
      );
      if (!isUserUpdated) {
        throw new AppError(404, "Пользователь не найден");
      }

      const cartUnset = Object.fromEntries(
        pricedItems.map((item) => [
          `items.${String(item.productId?._id ?? item.productId)}`,
          "",
        ]),
      );

      if (Object.keys(cartUnset).length > 0) {
        await CartModel.findOneAndUpdate(
          { userId: new mongoose.Types.ObjectId(String(userId)) },
          { $unset: cartUnset },
          withMongoSession({ upsert: true }, session),
        );
      }

      const promoProductIds = collectOrderedProductIdsWithPromo(pricedItems);
      if (promoProductIds.length > 0) {
        await consumeProductPromoActivationsForUser({
          userId: String(userId),
          productIds: promoProductIds,
          session,
        });
      }

      return createdOrder;
    });

    if (linkedPriceOfferId) {
      const productId = String(items[0].productId);
      try {
        await finalizeOffersAfterOrderConfirmed(productId, linkedPriceOfferId);
      } catch (finalizeError) {
        logServerEvent("error", {
          event: "money.order_finalize_offers_failed",
          orderId: String(created._id),
          error:
            finalizeError instanceof Error
              ? finalizeError.message
              : String(finalizeError),
        });
      }
    }

    logMoneyEvent("info", "order_created", {
      userId: String(userId),
      orderId: String(created._id),
      paymentMethod,
      itemCount: Array.isArray(items) ? items.length : 0,
    });

    try {
      const { emitOrderCreatedEvent } = await import(
        "../analytics-events/emitAnalyticsEvents.js"
      );
      const sellerUserIds = [
        ...new Set(
          Object.values(productById)
            .map((row) => (row?.sellerId != null ? String(row.sellerId) : null))
            .filter(Boolean),
        ),
      ];
      emitOrderCreatedEvent({
        orderId: String(created._id),
        buyerUserId: String(userId),
        totalAmount: Number(created.totalAmount) || 0,
        itemCount: Array.isArray(created.items) ? created.items.length : 0,
        sellerUserIds,
      });
    } catch {
      // analytics must not block order
    }

    void notifySellersAboutNewOrder({
      order: created,
      buyerUserId: String(userId),
      productById,
    }).catch((notifyError) => {
      logServerEvent("error", {
        event: "order_notify_sellers_failed",
        orderId: String(created._id),
        error:
          notifyError instanceof Error ? notifyError.message : String(notifyError),
      });
    });

    return created;
  } catch (txError) {
    if (!(txError instanceof AppError)) {
      logMoneyFailure(
        "order_create",
        { userId: String(userId), paymentMethod },
        txError,
      );
    } else if (txError.statusCode >= 500) {
      logMoneyFailure(
        "order_create",
        { userId: String(userId), paymentMethod },
        txError,
      );
    }
    if (txError instanceof AppError) {
      throw txError;
    }
    const message =
      txError instanceof Error ? txError.message : "Недостаточно баллов у продавца";
    throw new AppError(400, message);
  }
}
