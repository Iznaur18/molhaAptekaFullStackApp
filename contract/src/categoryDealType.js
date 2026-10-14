import { z } from "zod";

/**
 * Тип сделки категории: как покупатель и продавец доводят дело до конца.
 *
 * Дом, машину или стрижку не кладут в корзину и не везут курьером, поэтому
 * «Доставка / Самовывоз» у таких объявлений — ложное обещание. Тип задаёт
 * админ на узле дерева, подкатегории его наследуют; продавец тип не выбирает.
 */
export const CATEGORY_DEAL_TYPE_GOODS = "goods";
export const CATEGORY_DEAL_TYPE_VIEWING = "viewing";
export const CATEGORY_DEAL_TYPE_SERVICE = "service";

/** @type {readonly ["goods", "viewing", "service"]} */
export const CATEGORY_DEAL_TYPE_VALUES = [
  CATEGORY_DEAL_TYPE_GOODS,
  CATEGORY_DEAL_TYPE_VIEWING,
  CATEGORY_DEAL_TYPE_SERVICE,
];

export const CATEGORY_DEAL_TYPE_DEFAULT = CATEGORY_DEAL_TYPE_GOODS;

/**
 * Типы, которые не идут через корзину и заказ.
 *
 * Фильтровать в базе надо «не из этого списка», а не «равно goods»: у товаров,
 * созданных до появления поля, его нет вовсе, и они — обычные товары.
 */
export const CATEGORY_DEAL_TYPES_WITHOUT_CART = CATEGORY_DEAL_TYPE_VALUES.filter(
  (value) => value !== CATEGORY_DEAL_TYPE_GOODS,
);

export const CATEGORY_DEAL_TYPE_LABELS_RU = Object.freeze({
  [CATEGORY_DEAL_TYPE_GOODS]: "Товар: корзина, доставка, самовывоз",
  [CATEGORY_DEAL_TYPE_VIEWING]: "Осмотр: авто, недвижимость",
  [CATEGORY_DEAL_TYPE_SERVICE]: "Услуга: заявка исполнителю",
});

export const CATEGORY_DEAL_TYPE_NOT_PURCHASABLE_MESSAGE =
  "Это объявление нельзя заказать через корзину — свяжитесь с продавцом";

export const categoryDealTypeSchema = z.enum(CATEGORY_DEAL_TYPE_VALUES);

/**
 * Собственный тип узла: `null` — «как у родителя».
 */
export const categoryOwnDealTypeSchema = categoryDealTypeSchema.nullable();

/**
 * Пустое и незнакомое значение — обычный товар: так читаются все категории и
 * товары, созданные до появления типа сделки.
 *
 * @param {unknown} raw
 * @returns {"goods" | "viewing" | "service"}
 */
export const normalizeCategoryDealType = (raw) =>
  CATEGORY_DEAL_TYPE_VALUES.includes(/** @type {any} */ (raw))
    ? /** @type {"goods" | "viewing" | "service"} */ (raw)
    : CATEGORY_DEAL_TYPE_DEFAULT;

/**
 * Собственный тип узла: незнакомое значение — «наследовать».
 *
 * @param {unknown} raw
 * @returns {"goods" | "viewing" | "service" | null}
 */
export const normalizeCategoryOwnDealType = (raw) =>
  CATEGORY_DEAL_TYPE_VALUES.includes(/** @type {any} */ (raw))
    ? /** @type {"goods" | "viewing" | "service"} */ (raw)
    : null;

/**
 * Идёт ли объявление через корзину и заказ с доставкой или самовывозом.
 *
 * @param {unknown} dealType
 */
export const isCartDealType = (dealType) =>
  normalizeCategoryDealType(dealType) === CATEGORY_DEAL_TYPE_GOODS;

/**
 * @param {{ productDealType?: unknown } | null | undefined} product
 */
export const isProductPurchasableViaCart = (product) =>
  isCartDealType(product?.productDealType);
