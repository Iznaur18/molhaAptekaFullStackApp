/**
 * Продажа товара за баллы.
 *
 * Продавец включает её в «Управлении» товара: пока она включена, товар
 * покупают только баллами по цене `productPointsPrice`, а рублёвая цена
 * остаётся лежать на товаре и вернётся, когда продажу за баллы выключат.
 *
 * Правила живут в контракте, потому что их видят все три стороны: сервер
 * списывает баллы, корзина показывает сумму, управление товаром прячет акции.
 * Разойдись они — это спор о баллах, а 1 балл = 1 ₽ номинала.
 */
import { z } from "zod";

export const PRODUCT_POINTS_PRICE_MIN = 1;
export const PRODUCT_POINTS_PRICE_MAX = 10_000_000;

/** Лимит в одни руки по умолчанию: решение пользователя 21.10.2026. */
export const PRODUCT_POINTS_PER_BUYER_LIMIT_DEFAULT = 1;
export const PRODUCT_POINTS_PER_BUYER_LIMIT_MAX = 1000;

/**
 * Комиссия площадки с продажи за баллы, в процентах. Округляется ВВЕРХ
 * (решение пользователя 21.10.2026): у рублёвой комиссии округление вниз,
 * но баллы не делятся на копейки, и с маленькой цены иначе не бралось бы ничего.
 */
export const POINTS_SALE_COMMISSION_PERCENT = 2;

/** Сколько дней после вручения ждём подтверждения, прежде чем отдать баллы продавцу. */
export const POINTS_SALE_AUTO_RELEASE_DAYS = 7;

export const PRODUCT_POINTS_PRICE_MESSAGE = `Укажите цену в баллах от ${PRODUCT_POINTS_PRICE_MIN}`;
export const PRODUCT_POINTS_PER_BUYER_LIMIT_MESSAGE = `Лимит в одни руки — от 1 до ${PRODUCT_POINTS_PER_BUYER_LIMIT_MAX} шт.`;
export const PRODUCT_POINTS_SALE_PRICE_REQUIRED_MESSAGE =
  "Сначала укажите цену товара в баллах";
export const PRODUCT_POINTS_SALE_GOODS_ONLY_MESSAGE =
  "За баллы можно продавать только товары — не услуги, авто и недвижимость";
export const PRODUCT_POINTS_SALE_BLOCKED_BY_AUCTION_MESSAGE =
  "Выключите аукцион, чтобы продавать товар за баллы";
export const PRODUCT_POINTS_SALE_BLOCKED_BY_INSTALLMENT_MESSAGE =
  "Выключите рассрочку, чтобы продавать товар за баллы";
export const PRODUCT_POINTS_SALE_BLOCKED_BY_RAFFLE_MESSAGE =
  "Уберите товар из розыгрыша, чтобы продавать его за баллы";
export const PRODUCT_POINTS_SALE_BLOCKED_BY_FLASH_SALE_MESSAGE =
  "Завершите распродажу, чтобы продавать товар за баллы";
export const PRODUCT_POINTS_SALE_FEATURE_LOCKED_MESSAGE =
  "Товар продаётся за баллы: акции и дополнительные настройки для него недоступны";
export const PRODUCT_POINTS_SALE_MIXED_ORDER_MESSAGE =
  "Товары за баллы оформляются отдельным заказом";
export const PRODUCT_POINTS_SALE_PREPAID_FORBIDDEN_MESSAGE =
  "Доставку товара за баллы оплачивают при получении";
export const PRODUCT_POINTS_SALE_INSUFFICIENT_MESSAGE =
  "Недостаточно баллов для покупки";
export const PRODUCT_POINTS_SALE_OFFER_FORBIDDEN_MESSAGE =
  "Товар продаётся за баллы — предложить цену нельзя";
export const PRODUCT_POINTS_SALE_PROMOTION_FORBIDDEN_MESSAGE =
  "Товар продаётся за баллы — продвижение для него недоступно";

/** @param {number} limit */
export const buildPointsPerBuyerLimitExceededMessage = (limit) =>
  `В одни руки — не больше ${limit} шт. этого товара`;

/**
 * Поля товара, которые продажа за баллы выключает. Это все акции и
 * дополнительные режимы из «Управления»: покупка за баллы идёт без скидок,
 * кешбэка и партнёрки (решение пользователя 21.10.2026).
 *
 * Аукцион, рассрочка и розыгрыш сюда не входят: у них своя жизнь (ставки,
 * договоры, участники), и молча гасить их нельзя — продавец выключает их сам.
 */
export const PRODUCT_POINTS_SALE_FORCED_OFF_FIELDS = Object.freeze({
  productWholesaleEnabled: false,
  productBuyNFreeEnabled: false,
  productRentalEnabled: false,
  affiliateEnabled: false,
  affiliatePercent: 0,
  loyaltyPointsPerUnit: 0,
});

/** Поля PATCH, которые нельзя включать у товара за баллы. */
export const PRODUCT_POINTS_SALE_LOCKED_PATCH_FIELDS = Object.freeze([
  "productWholesaleEnabled",
  "productBuyNFreeEnabled",
  "productRentalEnabled",
  "affiliateEnabled",
  "loyaltyPointsPerUnit",
  "productAuctionEnabled",
  "productInstallmentEnabled",
  "productFlashSaleEnabled",
]);

export const productPointsPriceFieldSchema = z.coerce
  .number()
  .int(PRODUCT_POINTS_PRICE_MESSAGE)
  .min(PRODUCT_POINTS_PRICE_MIN, PRODUCT_POINTS_PRICE_MESSAGE)
  .max(PRODUCT_POINTS_PRICE_MAX, PRODUCT_POINTS_PRICE_MESSAGE);

/** `null` — без ограничения в одни руки. */
export const productPointsPerBuyerLimitFieldSchema = z.coerce
  .number()
  .int(PRODUCT_POINTS_PER_BUYER_LIMIT_MESSAGE)
  .min(1, PRODUCT_POINTS_PER_BUYER_LIMIT_MESSAGE)
  .max(PRODUCT_POINTS_PER_BUYER_LIMIT_MAX, PRODUCT_POINTS_PER_BUYER_LIMIT_MESSAGE)
  .nullable();

export const productPointsSalePatchFieldsShape = {
  productPointsSaleEnabled: z.coerce.boolean().optional(),
  productPointsPrice: productPointsPriceFieldSchema.optional(),
  productPointsPerBuyerLimit: productPointsPerBuyerLimitFieldSchema.optional(),
};

/**
 * Цена в баллах, если она задана: целое ≥ 1, иначе `null`.
 *
 * @param {unknown} raw
 * @returns {number | null}
 */
export const normalizeProductPointsPrice = (raw) => {
  // `Number(null) === 0`: пустая цена не должна выглядеть как «бесплатно».
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  const value = Math.floor(Number(raw));
  if (!Number.isFinite(value) || value < PRODUCT_POINTS_PRICE_MIN) {
    return null;
  }
  return Math.min(value, PRODUCT_POINTS_PRICE_MAX);
};

/**
 * Лимит в одни руки: число ≥ 1 или `null` (без ограничения).
 * Поле, которого у товара ещё нет, — это лимит по умолчанию, а не «без лимита».
 *
 * @param {unknown} raw
 * @returns {number | null}
 */
export const normalizeProductPointsPerBuyerLimit = (raw) => {
  if (raw === undefined) {
    return PRODUCT_POINTS_PER_BUYER_LIMIT_DEFAULT;
  }
  if (raw === null || raw === "") {
    return null;
  }
  const value = Math.floor(Number(raw));
  if (!Number.isFinite(value) || value < 1) {
    return PRODUCT_POINTS_PER_BUYER_LIMIT_DEFAULT;
  }
  return Math.min(value, PRODUCT_POINTS_PER_BUYER_LIMIT_MAX);
};

/**
 * Продаётся ли товар сейчас за баллы. Включённый флаг без цены — не продаётся:
 * купить «за ничего» нельзя.
 *
 * @param {Record<string, any> | null | undefined} product
 */
export const isProductPointsSaleActive = (product) =>
  product?.productPointsSaleEnabled === true &&
  normalizeProductPointsPrice(product?.productPointsPrice) !== null;

/**
 * @param {number} count
 * @returns {"балл" | "балла" | "баллов"}
 */
export const pluralizeRuBall = (count) => {
  const n = Math.abs(Math.trunc(Number(count)));
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "балл";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "балла";
  }
  return "баллов";
};

/** Неразрывный пробел между числом и словом, как у рублёвой цены. */
const NBSP = " ";

/**
 * «1 500 баллов» — разряды тем же форматом, что у рублёвой цены.
 *
 * @param {unknown} amount
 */
export const formatLoyaltyPointsAmount = (amount) => {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  const digits = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
    value,
  );
  return `${digits}${NBSP}${pluralizeRuBall(value)}`;
};

/**
 * Делит баллы позиции на комиссию площадки и долю продавца.
 * `commission + seller === total` всегда: доля продавца — вычитанием.
 *
 * @param {unknown} totalPoints
 * @returns {{ total: number; commission: number; seller: number }}
 */
export const splitPointsSaleForPlatform = (totalPoints) => {
  const total = Math.max(0, Math.floor(Number(totalPoints) || 0));
  const commission = Math.min(
    total,
    Math.ceil((total * POINTS_SALE_COMMISSION_PERCENT) / 100),
  );
  return { total, commission, seller: total - commission };
};
