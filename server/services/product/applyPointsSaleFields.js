import {
  PRODUCT_POINTS_SALE_BLOCKED_BY_AUCTION_MESSAGE,
  PRODUCT_POINTS_SALE_BLOCKED_BY_FLASH_SALE_MESSAGE,
  PRODUCT_POINTS_SALE_BLOCKED_BY_INSTALLMENT_MESSAGE,
  PRODUCT_POINTS_SALE_BLOCKED_BY_RAFFLE_MESSAGE,
  PRODUCT_POINTS_SALE_FEATURE_LOCKED_MESSAGE,
  PRODUCT_POINTS_SALE_FORCED_OFF_FIELDS,
  PRODUCT_POINTS_SALE_GOODS_ONLY_MESSAGE,
  PRODUCT_POINTS_SALE_LOCKED_PATCH_FIELDS,
  PRODUCT_POINTS_SALE_PRICE_REQUIRED_MESSAGE,
  isProductPurchasableViaCart,
  normalizeProductPointsPerBuyerLimit,
  normalizeProductPointsPrice,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";

const hasBodyField = (body, field) => Object.prototype.hasOwnProperty.call(body, field);

/**
 * Включает ли тело PATCH что-то из акций и доп. режимов. Выключать их можно
 * всегда — запрещено только включение.
 *
 * @param {Record<string, unknown>} body
 */
const bodyEnablesLockedFeature = (body) =>
  PRODUCT_POINTS_SALE_LOCKED_PATCH_FIELDS.some((field) => {
    if (!hasBodyField(body, field)) {
      return false;
    }
    if (field === "loyaltyPointsPerUnit") {
      return Math.floor(Number(body[field]) || 0) > 0;
    }
    return body[field] === true;
  });

/**
 * Продажа за баллы в PATCH товара.
 *
 * Включение гасит все простые акции разом (опт, «N+1», аренда, кешбэк,
 * партнёрка): у товара за баллы их не бывает (решение пользователя
 * 21.10.2026). Аукцион, рассрочку, розыгрыш и распродажу молча не гасим —
 * у них ставки, договоры, участники и восстановление цены; продавец
 * выключает их сам, а мы говорим, что именно мешает.
 *
 * Вызывать ПОСЛЕ остальных apply*: принудительные `false` должны перекрыть
 * то, что успели положить в $set соседние поля.
 *
 * @param {Record<string, unknown>} body
 * @param {Record<string, unknown>} $set
 * @param {Record<string, any>} existing
 */
export const applyPointsSaleFields = (body, $set, existing) => {
  const touchesEnabled = hasBodyField(body, "productPointsSaleEnabled");
  const touchesPrice = hasBodyField(body, "productPointsPrice");
  const touchesLimit = hasBodyField(body, "productPointsPerBuyerLimit");

  if (touchesPrice) {
    const price = normalizeProductPointsPrice(body.productPointsPrice);
    if (price === null) {
      throw new AppError(400, PRODUCT_POINTS_SALE_PRICE_REQUIRED_MESSAGE);
    }
    $set.productPointsPrice = price;
  }
  if (touchesLimit) {
    $set.productPointsPerBuyerLimit = normalizeProductPointsPerBuyerLimit(
      body.productPointsPerBuyerLimit,
    );
  }

  const wasEnabled = existing.productPointsSaleEnabled === true;
  const nextEnabled = touchesEnabled
    ? body.productPointsSaleEnabled === true
    : wasEnabled;

  if (touchesEnabled) {
    $set.productPointsSaleEnabled = nextEnabled;
  }

  if (!nextEnabled) {
    return;
  }

  const nextPrice = touchesPrice
    ? $set.productPointsPrice
    : normalizeProductPointsPrice(existing.productPointsPrice);
  if (nextPrice === null) {
    throw new AppError(400, PRODUCT_POINTS_SALE_PRICE_REQUIRED_MESSAGE);
  }

  const nextDealType = $set.productDealType ?? existing.productDealType;
  if (!isProductPurchasableViaCart({ productDealType: nextDealType })) {
    throw new AppError(400, PRODUCT_POINTS_SALE_GOODS_ONLY_MESSAGE);
  }

  if (wasEnabled && bodyEnablesLockedFeature(body)) {
    throw new AppError(400, PRODUCT_POINTS_SALE_FEATURE_LOCKED_MESSAGE);
  }

  if (!wasEnabled) {
    const auctionOn = hasBodyField($set, "productAuctionEnabled")
      ? $set.productAuctionEnabled === true
      : existing.productAuctionEnabled === true;
    if (auctionOn) {
      throw new AppError(409, PRODUCT_POINTS_SALE_BLOCKED_BY_AUCTION_MESSAGE);
    }
    if (existing.productInstallmentEnabled === true) {
      throw new AppError(409, PRODUCT_POINTS_SALE_BLOCKED_BY_INSTALLMENT_MESSAGE);
    }
    if (existing.activeRaffleId != null) {
      throw new AppError(409, PRODUCT_POINTS_SALE_BLOCKED_BY_RAFFLE_MESSAGE);
    }
    const flashSaleOn = hasBodyField($set, "productFlashSaleEnabled")
      ? $set.productFlashSaleEnabled === true
      : existing.productFlashSaleEnabled === true;
    if (flashSaleOn) {
      throw new AppError(409, PRODUCT_POINTS_SALE_BLOCKED_BY_FLASH_SALE_MESSAGE);
    }
  }

  Object.assign($set, PRODUCT_POINTS_SALE_FORCED_OFF_FIELDS);
};
