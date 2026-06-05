import {
  IN_APP_NOTIFICATION_KIND_PRICE_OFFER_ACCEPTED,
  IN_APP_NOTIFICATION_KIND_PRICE_OFFER_OUTBID_WON,
  IN_APP_NOTIFICATION_KIND_PRICE_OFFER_REJECTED,
  IN_APP_NOTIFICATION_KIND_PRICE_OFFER_SELLER,
  IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_ACCEPTED,
  IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_OUTBID_WON,
  IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_REJECTED,
  IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_SELLER,
  PRICE_OFFER_PAYMENT_DEADLINE_MS,
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_CANCELLED,
  PRICE_OFFER_STATUS_PENDING,
  PRICE_OFFER_STATUS_REJECTED,
  PRICE_OFFER_TOP_PUBLIC_LIMIT,
} from "../constants/productPriceOfferConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { ProductModel, ProductPriceOfferModel, UserModel } from "../models/index.js";
import { createUserInAppNotification } from "./userInAppNotifications.js";
import {
  assertAuctionAcceptsBids,
  closeProductAuction,
  computeAuctionActive,
} from "./productAuction.js";
import { assertProductPriceRubWithinMax } from "./productDiscount.js";

const BUYER_PUBLIC_SELECT = "_id userName isPremiumUser isUserDataConfirmed";
const TOP_BUYER_SELECT = "_id userName";

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const releaseExpiredAcceptedOffers = async (productId = null) => {
  const now = new Date();
  const query = {
    status: PRICE_OFFER_STATUS_ACCEPTED,
    orderId: null,
    paymentDeadlineAt: { $lt: now },
  };
  if (productId) {
    query.productId = productId;
  }

  await ProductPriceOfferModel.updateMany(query, {
    $set: {
      status: PRICE_OFFER_STATUS_PENDING,
      acceptedAt: null,
      paymentDeadlineAt: null,
      reviewedBy: null,
      reviewedAt: null,
    },
  });
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {{ notifyBuyers?: boolean }} [options]
 */
export const rejectAllPendingOffersForProduct = async (
  productId,
  { notifyBuyers = false } = {},
) => {
  const pending = await ProductPriceOfferModel.find({
    productId,
    status: PRICE_OFFER_STATUS_PENDING,
  })
    .select("buyerUserId")
    .lean();

  if (pending.length === 0) {
    return { rejectedCount: 0 };
  }

  const now = new Date();
  await ProductPriceOfferModel.updateMany(
    { productId, status: PRICE_OFFER_STATUS_PENDING },
    {
      $set: {
        status: PRICE_OFFER_STATUS_REJECTED,
        reviewedAt: now,
      },
    },
  );

  if (notifyBuyers) {
    const buyerIds = [...new Set(pending.map((row) => String(row.buyerUserId)))];
    for (const buyerId of buyerIds) {
      await createUserInAppNotification({
        userId: buyerId,
        kind: IN_APP_NOTIFICATION_KIND_PRICE_OFFER_REJECTED,
        message: IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_REJECTED,
        productId,
      });
    }
  }

  return { rejectedCount: pending.length };
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {import('mongoose').Types.ObjectId | string} winningOfferId
 */
export const finalizeOffersAfterOrderConfirmed = async (productId, winningOfferId) => {
  const losers = await ProductPriceOfferModel.find({
    productId,
    status: PRICE_OFFER_STATUS_PENDING,
  })
    .select("buyerUserId")
    .lean();

  const now = new Date();
  await ProductPriceOfferModel.updateMany(
    {
      productId,
      status: PRICE_OFFER_STATUS_PENDING,
    },
    {
      $set: {
        status: PRICE_OFFER_STATUS_REJECTED,
        reviewedAt: now,
      },
    },
  );

  await closeProductAuction(productId, { markCompletedOnce: true });

  const loserIds = [...new Set(losers.map((row) => String(row.buyerUserId)))];
  for (const buyerId of loserIds) {
    await createUserInAppNotification({
      userId: buyerId,
      kind: IN_APP_NOTIFICATION_KIND_PRICE_OFFER_OUTBID_WON,
      message: IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_OUTBID_WON,
      productId,
    });
  }

  return { rejectedCount: losers.length, winningOfferId };
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const notifySellerAboutPriceOffer = async (productId) => {
  const product = await ProductModel.findById(productId).select("productSeller").lean();
  if (!product?.productSeller) {
    return;
  }

  await createUserInAppNotification({
    userId: product.productSeller,
    kind: IN_APP_NOTIFICATION_KIND_PRICE_OFFER_SELLER,
    message: IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_SELLER,
    productId,
  });
};

/**
 * @param {import('mongoose').Types.ObjectId | string} buyerUserId
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const assertBuyerCanSubmitPriceOffer = async (buyerUserId, productId) => {
  const user = await UserModel.findById(buyerUserId)
    .select("isUserDataConfirmed isBlockedUser")
    .lean();

  if (!user) {
    throw new Error("Пользователь не найден");
  }
  if (user.isBlockedUser) {
    throw new Error("Аккаунт заблокирован");
  }
  if (user.isUserDataConfirmed !== true) {
    throw new Error("Предложение цены доступно только с подтверждёнными данными");
  }

  const product = await ProductModel.findById(productId)
    .select(
      "productSeller productModerationStatus productIsAvailable productAuctionEnabled",
    )
    .lean();

  if (!product) {
    throw new Error("Товар не найден");
  }
  if (String(product.productSeller) === String(buyerUserId)) {
    throw new Error("Нельзя предложить цену на свой товар");
  }

  assertAuctionAcceptsBids(product);

  return product;
};

/**
 * @param {unknown} raw
 */
export const normalizeOfferPrice = (raw) => {
  const price = Math.floor(Number(raw));
  if (!Number.isFinite(price) || price < 1) {
    throw new Error("Цена должна быть целым числом больше 0");
  }
  assertProductPriceRubWithinMax(price);
  return price;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const loadProductForAuctionGate = async (productId) => {
  const product = await ProductModel.findById(productId)
    .select(
      "productSeller productModerationStatus productIsAvailable productAuctionEnabled productAuctionCompletedOnce",
    )
    .lean();

  if (!product) {
    throw new Error("Товар не найден");
  }

  return product;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const getPublicTopPriceOffers = async (productId) => {
  const product = await loadProductForAuctionGate(productId);
  if (!computeAuctionActive(product)) {
    return [];
  }

  await releaseExpiredAcceptedOffers(productId);

  const rows = await ProductPriceOfferModel.find({
    productId,
    status: PRICE_OFFER_STATUS_PENDING,
  })
    .sort({ offerPrice: -1, createdAt: 1 })
    .limit(PRICE_OFFER_TOP_PUBLIC_LIMIT)
    .populate("buyerUserId", TOP_BUYER_SELECT)
    .lean();

  return rows.map((row) => ({
    _id: row._id,
    offerPrice: row.offerPrice,
    createdAt: row.createdAt,
    buyer:
      row.buyerUserId != null && typeof row.buyerUserId === "object"
        ? row.buyerUserId
        : null,
  }));
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {import('mongoose').Types.ObjectId | string} sellerUserId
 */
export const getSellerPriceOffers = async (productId, sellerUserId) => {
  await releaseExpiredAcceptedOffers(productId);
  await assertSellerOwnsProduct(productId, sellerUserId);

  const product = await loadProductForAuctionGate(productId);
  if (!computeAuctionActive(product)) {
    return [];
  }

  const rows = await ProductPriceOfferModel.find({
    productId,
    status: {
      $in: [PRICE_OFFER_STATUS_PENDING, PRICE_OFFER_STATUS_ACCEPTED],
    },
  })
    .sort({ offerPrice: -1, createdAt: 1 })
    .populate("buyerUserId", BUYER_PUBLIC_SELECT)
    .lean();

  return rows.map((row) => ({
    ...row,
    buyer:
      row.buyerUserId != null && typeof row.buyerUserId === "object"
        ? row.buyerUserId
        : null,
  }));
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {import('mongoose').Types.ObjectId | string} sellerUserId
 */
export const getSellerPriceOfferArchive = async (productId, sellerUserId) => {
  await assertSellerOwnsProduct(productId, sellerUserId);

  const rows = await ProductPriceOfferModel.find({
    productId,
    $or: [
      {
        status: {
          $in: [PRICE_OFFER_STATUS_REJECTED, PRICE_OFFER_STATUS_CANCELLED],
        },
      },
      { orderId: { $ne: null } },
    ],
  })
    .sort({ updatedAt: -1 })
    .populate("buyerUserId", BUYER_PUBLIC_SELECT)
    .lean();

  return rows.map((row) => ({
    ...row,
    buyer:
      row.buyerUserId != null && typeof row.buyerUserId === "object"
        ? row.buyerUserId
        : null,
  }));
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const hasActiveAcceptedOffer = async (productId) => {
  await releaseExpiredAcceptedOffers(productId);
  const row = await ProductPriceOfferModel.findOne({
    productId,
    status: PRICE_OFFER_STATUS_ACCEPTED,
  }).lean();
  return Boolean(row);
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {import('mongoose').Types.ObjectId | string} sellerUserId
 */
/**
 * @param {import('mongoose').Types.ObjectId | string} priceOfferId
 * @param {import('mongoose').Types.ObjectId | string} buyerUserId
 * @param {string} productId
 */
export const resolveAcceptedOfferForOrder = async (
  priceOfferId,
  buyerUserId,
  productId,
) => {
  await releaseExpiredAcceptedOffers(productId);

  const offer = await ProductPriceOfferModel.findOne({
    _id: priceOfferId,
    productId,
    buyerUserId,
    status: PRICE_OFFER_STATUS_ACCEPTED,
    orderId: null,
  }).lean();

  if (!offer) {
    throw new Error("Принятое предложение не найдено или срок оплаты истёк");
  }

  if (offer.paymentDeadlineAt && offer.paymentDeadlineAt < new Date()) {
    throw new Error("Срок оплаты по предложению истёк");
  }

  const product = await ProductModel.findById(productId)
    .select("productName productModerationStatus productIsAvailable")
    .lean();

  if (!product) {
    throw new Error("Товар не найден");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    throw new Error("Товар недоступен для заказа");
  }

  const name = String(product.productName ?? "").trim();

  return {
    offer,
    price: offer.offerPrice,
    name: name.length > 0 ? name : "Товар без названия",
  };
};

export const assertSellerOwnsProduct = async (productId, sellerUserId) => {
  const product = await ProductModel.findById(productId)
    .select(
      "productSeller productAuctionEnabled productModerationStatus productIsAvailable",
    )
    .lean();

  if (!product) {
    throw new Error("Товар не найден");
  }
  if (String(product.productSeller) !== String(sellerUserId)) {
    throw new Error("Доступ только для продавца");
  }

  return product;
};

const DASHBOARD_PRODUCT_SELECT =
  "productName productImageUrls productImageUrl productSeller productAuctionEnabled productModerationStatus productIsAvailable";

/**
 * @param {Record<string, unknown> | null | undefined} product
 */
const buildDashboardProductSnapshot = (product) => {
  if (product == null || typeof product !== "object") {
    return null;
  }

  const urls = Array.isArray(product.productImageUrls) ? product.productImageUrls : [];
  const imageUrl =
    urls.length > 0
      ? String(urls[0])
      : product.productImageUrl != null
        ? String(product.productImageUrl)
        : null;

  return {
    _id: String(product._id),
    productName: String(product.productName ?? "").trim() || "Товар без названия",
    productImageUrl: imageUrl,
    auctionActive: computeAuctionActive(product),
  };
};

/**
 * @param {Record<string, unknown>} row
 */
const mapBuyerPublic = (row) =>
  row != null && typeof row === "object"
    ? {
        _id: String(row._id),
        userName: row.userName ?? "",
        isPremiumUser: row.isPremiumUser === true,
        isUserDataConfirmed: row.isUserDataConfirmed === true,
      }
    : null;

/**
 * @param {Array<Record<string, unknown>>} rows
 */
const sortBuyerDashboardBids = (rows) => {
  const accepted = rows
    .filter((row) => row.status === PRICE_OFFER_STATUS_ACCEPTED)
    .sort((a, b) => {
      const aDeadline = a.paymentDeadlineAt
        ? new Date(a.paymentDeadlineAt).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bDeadline = b.paymentDeadlineAt
        ? new Date(b.paymentDeadlineAt).getTime()
        : Number.MAX_SAFE_INTEGER;
      return aDeadline - bDeadline;
    });
  const pending = rows
    .filter((row) => row.status === PRICE_OFFER_STATUS_PENDING)
    .sort((a, b) => {
      if (b.offerPrice !== a.offerPrice) {
        return b.offerPrice - a.offerPrice;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return [...accepted, ...pending];
};

/**
 * @param {Array<Record<string, unknown>>} rows
 */
const sortIncomingDashboardOffers = (rows) => {
  const pending = rows
    .filter((row) => row.status === PRICE_OFFER_STATUS_PENDING)
    .sort((a, b) => {
      if (b.offerPrice !== a.offerPrice) {
        return b.offerPrice - a.offerPrice;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const accepted = rows
    .filter((row) => row.status === PRICE_OFFER_STATUS_ACCEPTED)
    .sort((a, b) => b.offerPrice - a.offerPrice);

  return [...pending, ...accepted];
};

/**
 * @param {import('mongoose').Types.ObjectId | string} buyerUserId
 */
export const getMyPriceOfferBids = async (buyerUserId) => {
  await releaseExpiredAcceptedOffers();

  const rows = await ProductPriceOfferModel.find({
    buyerUserId,
    status: {
      $in: [PRICE_OFFER_STATUS_PENDING, PRICE_OFFER_STATUS_ACCEPTED],
    },
    orderId: null,
  })
    .sort({ createdAt: -1 })
    .populate("productId", DASHBOARD_PRODUCT_SELECT)
    .lean();

  const mapped = rows
    .filter((row) => row.productId != null)
    .map((row) => ({
      _id: String(row._id),
      productId: String(row.productId._id ?? row.productId),
      product: buildDashboardProductSnapshot(
        typeof row.productId === "object" ? row.productId : null,
      ),
      offerPrice: row.offerPrice,
      status: row.status,
      createdAt: row.createdAt,
      paymentDeadlineAt: row.paymentDeadlineAt,
    }));

  return sortBuyerDashboardBids(mapped);
};

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerUserId
 */
const loadActiveAuctionProductIdsForSeller = async (sellerUserId) => {
  const products = await ProductModel.find({
    productSeller: sellerUserId,
    productAuctionEnabled: true,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
  })
    .select(DASHBOARD_PRODUCT_SELECT)
    .lean();

  return products.filter((product) => computeAuctionActive(product));
};

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerUserId
 */
export const getIncomingPriceOffersForSeller = async (sellerUserId) => {
  await releaseExpiredAcceptedOffers();

  const activeProducts = await loadActiveAuctionProductIdsForSeller(sellerUserId);
  if (activeProducts.length === 0) {
    return [];
  }

  const productById = new Map(
    activeProducts.map((product) => [String(product._id), product]),
  );
  const productIds = activeProducts.map((product) => product._id);

  const rows = await ProductPriceOfferModel.find({
    productId: { $in: productIds },
    status: {
      $in: [PRICE_OFFER_STATUS_PENDING, PRICE_OFFER_STATUS_ACCEPTED],
    },
    orderId: null,
  })
    .sort({ offerPrice: -1, createdAt: 1 })
    .populate("buyerUserId", BUYER_PUBLIC_SELECT)
    .lean();

  const mapped = rows.map((row) => ({
    _id: String(row._id),
    productId: String(row.productId),
    product: buildDashboardProductSnapshot(
      productById.get(String(row.productId)) ?? null,
    ),
    offerPrice: row.offerPrice,
    status: row.status,
    createdAt: row.createdAt,
    paymentDeadlineAt: row.paymentDeadlineAt,
    buyer: mapBuyerPublic(typeof row.buyerUserId === "object" ? row.buyerUserId : null),
  }));

  return sortIncomingDashboardOffers(mapped);
};

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerUserId
 */
export const countIncomingPendingPriceOffersForSeller = async (sellerUserId) => {
  await releaseExpiredAcceptedOffers();

  const activeProducts = await loadActiveAuctionProductIdsForSeller(sellerUserId);
  if (activeProducts.length === 0) {
    return 0;
  }

  return ProductPriceOfferModel.countDocuments({
    productId: { $in: activeProducts.map((product) => product._id) },
    status: PRICE_OFFER_STATUS_PENDING,
    orderId: null,
  });
};

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export const countAuctionTabActionItems = async (userId) => {
  await releaseExpiredAcceptedOffers();
  const [bids, offers] = await Promise.all([
    getMyPriceOfferBids(userId),
    getIncomingPriceOffersForSeller(userId),
  ]);
  return bids.length + offers.length;
};
