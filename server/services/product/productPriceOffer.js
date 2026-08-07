import { ProductPriceOfferModel } from "../../models/index.js";
import {
  IN_APP_NOTIFICATION_KIND_PRICE_OFFER_ACCEPTED,
  IN_APP_NOTIFICATION_KIND_PRICE_OFFER_REJECTED,
  IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_ACCEPTED,
  IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_REJECTED,
  PRICE_OFFER_PAYMENT_DEADLINE_MS,
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_CANCELLED,
  PRICE_OFFER_STATUS_PENDING,
  PRICE_OFFER_STATUS_REJECTED,
} from "../../constants/productPriceOfferConstants.js";
import { AppError } from "../../errors/AppError.js";
import {
  assertBuyerCanSubmitPriceOffer,
  assertSellerOwnsProduct,
  getPublicTopPriceOffers,
  getSellerPriceOfferArchive,
  getSellerPriceOffers,
  hasActiveAcceptedOffer,
  loadProductForAuctionGate,
  normalizeOfferPrice,
  notifySellerAboutPriceOffer,
  releaseExpiredAcceptedOffers,
} from "./productPriceOfferHelpers.js";
import { assertAuctionAcceptsBids } from "./productAuction.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

const throwFieldError = (error, fallback) => {
  throw new AppError(400, error instanceof Error ? error.message : fallback);
};

const mapSellerAccessError = (error) => {
  const message = error instanceof Error ? error.message : "Нет доступа";
  const status = message === "Товар не найден" ? 404 : 403;
  throw new AppError(status, message);
};

const mapAcceptGateError = (error) => {
  const message = error instanceof Error ? error.message : "Нет доступа";
  const status =
    message === "Товар не найден" ? 404 : message.includes("аукцион") ? 409 : 403;
  throw new AppError(status, message);
};

/**
 * @param {{
 *   buyerId: string;
 *   productId: string;
 *   offerPrice: unknown;
 * }} input
 */
export async function submitProductPriceOffer({
  buyerId,
  productId,
  offerPrice: rawPrice,
}) {
  let offerPrice;
  try {
    offerPrice = normalizeOfferPrice(rawPrice);
  } catch (error) {
    throwFieldError(error, "Некорректная цена");
  }

  try {
    await assertBuyerCanSubmitPriceOffer(buyerId, productId);
  } catch (error) {
    throwFieldError(error, "Нельзя отправить предложение");
  }

  try {
    const existing = await ProductPriceOfferModel.findOne({
      productId,
      buyerUserId: buyerId,
      status: PRICE_OFFER_STATUS_PENDING,
    });

    if (existing) {
      existing.offerPrice = offerPrice;
      await existing.save();
      await notifySellerAboutPriceOffer(productId);
      return { offer: existing, message: "Цена обновлена" };
    }

    const offer = await ProductPriceOfferModel.create({
      productId,
      buyerUserId: buyerId,
      offerPrice,
    });

    await notifySellerAboutPriceOffer(productId);
    return { offer, message: "Предложение принято" };
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(409, "У вас уже есть активное предложение");
    }
    throw error;
  }
}

/**
 * @param {{
 *   buyerId: string;
 *   productId: string;
 *   offerPrice: unknown;
 * }} input
 */
export async function patchMyProductPriceOffer({
  buyerId,
  productId,
  offerPrice: rawPrice,
}) {
  let offerPrice;
  try {
    offerPrice = normalizeOfferPrice(rawPrice);
  } catch (error) {
    throwFieldError(error, "Некорректная цена");
  }

  try {
    await assertBuyerCanSubmitPriceOffer(buyerId, productId);
  } catch (error) {
    throwFieldError(error, "Нельзя изменить предложение");
  }

  const offer = await ProductPriceOfferModel.findOne({
    productId,
    buyerUserId: buyerId,
    status: PRICE_OFFER_STATUS_PENDING,
  });

  if (!offer) {
    throw new AppError(404, "Активное предложение не найдено");
  }

  offer.offerPrice = offerPrice;
  await offer.save();
  await notifySellerAboutPriceOffer(productId);

  return { offer, message: "Цена обновлена" };
}

/**
 * @param {{
 *   buyerId: string;
 *   productId: string;
 * }} input
 */
export async function cancelMyProductPriceOffer({ buyerId, productId }) {
  await releaseExpiredAcceptedOffers(productId);

  const offer = await ProductPriceOfferModel.findOneAndUpdate(
    {
      productId,
      buyerUserId: buyerId,
      status: { $in: [PRICE_OFFER_STATUS_PENDING, PRICE_OFFER_STATUS_ACCEPTED] },
      orderId: null,
    },
    {
      $set: {
        status: PRICE_OFFER_STATUS_CANCELLED,
        acceptedAt: null,
        paymentDeadlineAt: null,
      },
    },
    { returnDocument: "after" },
  );

  if (!offer) {
    throw new AppError(404, "Активное предложение не найдено");
  }

  return { message: "Предложение отменено" };
}

/**
 * @param {{
 *   buyerId: string;
 *   productId: string;
 * }} input
 */
export async function getMyProductPriceOffer({ buyerId, productId }) {
  await releaseExpiredAcceptedOffers(productId);

  // Только живое участие: pending / accepted без заказа.
  // accepted+orderId — прошлый выигрыш; после re-open аукциона можно ставить снова.
  const offer = await ProductPriceOfferModel.findOne({
    productId,
    buyerUserId: buyerId,
    status: {
      $in: [PRICE_OFFER_STATUS_PENDING, PRICE_OFFER_STATUS_ACCEPTED],
    },
    orderId: null,
  })
    .sort({ updatedAt: -1 })
    .lean();

  return { offer: offer ?? null };
}

/**
 * @param {{ productId: string }} input
 */
export async function getTopProductPriceOffers({ productId }) {
  const top = await getPublicTopPriceOffers(productId);
  return { top };
}

/**
 * @param {{
 *   sellerId: string;
 *   productId: string;
 * }} input
 */
export async function getSellerProductPriceOffers({ sellerId, productId }) {
  try {
    const offers = await getSellerPriceOffers(productId, sellerId);
    return { offers };
  } catch (error) {
    mapSellerAccessError(error);
  }
}

/**
 * @param {{
 *   sellerId: string;
 *   productId: string;
 *   offerId: string;
 * }} input
 */
export async function acceptProductPriceOffer({ sellerId, productId, offerId }) {
  await releaseExpiredAcceptedOffers(productId);

  if (await hasActiveAcceptedOffer(productId)) {
    throw new AppError(409, "Уже есть принятое предложение, ожидающее оплаты");
  }

  const offer = await ProductPriceOfferModel.findOne({
    _id: offerId,
    productId,
    status: PRICE_OFFER_STATUS_PENDING,
  });

  if (!offer) {
    throw new AppError(404, "Предложение не найдено");
  }

  try {
    await assertSellerOwnsProduct(productId, sellerId);
    const product = await loadProductForAuctionGate(productId);
    assertAuctionAcceptsBids(product);
  } catch (error) {
    mapAcceptGateError(error);
  }

  try {
    const now = new Date();
    offer.status = PRICE_OFFER_STATUS_ACCEPTED;
    offer.acceptedAt = now;
    offer.paymentDeadlineAt = new Date(now.getTime() + PRICE_OFFER_PAYMENT_DEADLINE_MS);
    offer.reviewedBy = sellerId;
    offer.reviewedAt = now;
    await offer.save();

    await createUserInAppNotification({
      userId: offer.buyerUserId,
      kind: IN_APP_NOTIFICATION_KIND_PRICE_OFFER_ACCEPTED,
      message: IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_ACCEPTED,
      productId,
    });

    return { offer };
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(409, "Уже есть принятое предложение, ожидающее оплаты");
    }
    throw error;
  }
}

/**
 * @param {{
 *   sellerId: string;
 *   productId: string;
 *   offerId: string;
 * }} input
 */
export async function rejectProductPriceOffer({ sellerId, productId, offerId }) {
  const offer = await ProductPriceOfferModel.findOne({
    _id: offerId,
    productId,
    status: PRICE_OFFER_STATUS_PENDING,
  });

  if (!offer) {
    throw new AppError(404, "Предложение не найдено");
  }

  try {
    await assertSellerOwnsProduct(productId, sellerId);
  } catch (error) {
    throw new AppError(403, error instanceof Error ? error.message : "Нет доступа");
  }

  const now = new Date();
  offer.status = PRICE_OFFER_STATUS_REJECTED;
  offer.reviewedBy = sellerId;
  offer.reviewedAt = now;
  await offer.save();

  await createUserInAppNotification({
    userId: offer.buyerUserId,
    kind: IN_APP_NOTIFICATION_KIND_PRICE_OFFER_REJECTED,
    message: IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_REJECTED,
    productId,
  });

  return { offer };
}

/**
 * @param {{
 *   sellerId: string;
 *   productId: string;
 * }} input
 */
export async function getSellerProductPriceOfferArchive({ sellerId, productId }) {
  try {
    const offers = await getSellerPriceOfferArchive(productId, sellerId);
    return { offers };
  } catch (error) {
    mapSellerAccessError(error);
  }
}
