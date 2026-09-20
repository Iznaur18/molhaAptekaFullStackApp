import { z } from "zod";

/**
 * Вес и габариты товара — то, из чего служба доставки считает цену.
 *
 * Поля необязательные: у тысяч уже созданных товаров их нет, и требовать
 * заполнения задним числом нельзя. Когда значения не заданы, расчёт берёт
 * «среднюю коробку» платформы и честно помечает цену приблизительной —
 * иначе морозильник уехал бы по тарифу килограммовой посылки за счёт продавца.
 */

export const PRODUCT_WEIGHT_G_MIN = 1;
/** 150 кг: выше начинается грузовая отправка, а не посылка. */
export const PRODUCT_WEIGHT_G_MAX = 150_000;

export const PRODUCT_DIMENSION_CM_MIN = 1;
/** 300 см — предел габарита одной стороны у большинства служб. */
export const PRODUCT_DIMENSION_CM_MAX = 300;

/** Средняя коробка: используется, пока у товара нет своих значений. */
export const PRODUCT_DEFAULT_SHIPPING = {
  weightG: 1000,
  lengthCm: 30,
  widthCm: 20,
  heightCm: 15,
};

const weightSchema = z.coerce
  .number()
  .int()
  .min(PRODUCT_WEIGHT_G_MIN, "Вес должен быть больше нуля")
  .max(PRODUCT_WEIGHT_G_MAX, "Для такого веса нужна грузовая отправка, не посылка");

const dimensionSchema = z.coerce
  .number()
  .int()
  .min(PRODUCT_DIMENSION_CM_MIN, "Размер должен быть больше нуля")
  .max(PRODUCT_DIMENSION_CM_MAX, "Сторона больше 3 метров службами не принимается");

/** Поля для схем создания и правки товара. */
export const productShippingFieldsShape = {
  productWeightG: weightSchema.nullable().optional(),
  productLengthCm: dimensionSchema.nullable().optional(),
  productWidthCm: dimensionSchema.nullable().optional(),
  productHeightCm: dimensionSchema.nullable().optional(),
};

/**
 * @typedef {{
 *   productWeightG?: number | null;
 *   productLengthCm?: number | null;
 *   productWidthCm?: number | null;
 *   productHeightCm?: number | null;
 * }} ProductShippingFields
 */

/**
 * Заданы ли у товара собственные вес и габариты полностью.
 *
 * Частично заполненным не верим: без одной стороны объём не посчитать, а
 * подставлять её из «средней коробки» — тихо врать в расчёте.
 *
 * @param {ProductShippingFields | null | undefined} product
 * @returns {boolean}
 */
export function hasProductShippingDimensions(product) {
  return (
    Number.isFinite(Number(product?.productWeightG)) &&
    Number(product?.productWeightG) > 0 &&
    Number.isFinite(Number(product?.productLengthCm)) &&
    Number(product?.productLengthCm) > 0 &&
    Number.isFinite(Number(product?.productWidthCm)) &&
    Number(product?.productWidthCm) > 0 &&
    Number.isFinite(Number(product?.productHeightCm)) &&
    Number(product?.productHeightCm) > 0
  );
}

/**
 * Вес и габариты товара или значения по умолчанию.
 *
 * @param {ProductShippingFields | null | undefined} product
 */
export function resolveProductShipping(product) {
  if (!hasProductShippingDimensions(product)) {
    return { ...PRODUCT_DEFAULT_SHIPPING, exact: false };
  }
  return {
    weightG: Number(product.productWeightG),
    lengthCm: Number(product.productLengthCm),
    widthCm: Number(product.productWidthCm),
    heightCm: Number(product.productHeightCm),
    exact: true,
  };
}

/**
 * Одна посылка на весь заказ.
 *
 * Вес складываем, длину и ширину берём наибольшие, высоты суммируем — так
 * коробки ставятся стопкой. Это не точная упаковка, но ошибается в сторону
 * большего габарита, а значит в сторону честной цены.
 *
 * @param {ProductShippingFields[]} products
 */
export function buildShipmentPackage(products) {
  const list = Array.isArray(products) && products.length > 0 ? products : [null];
  let weightG = 0;
  let lengthCm = 0;
  let widthCm = 0;
  let heightCm = 0;
  let exact = true;

  for (const product of list) {
    const item = resolveProductShipping(product);
    weightG += item.weightG;
    lengthCm = Math.max(lengthCm, item.lengthCm);
    widthCm = Math.max(widthCm, item.widthCm);
    heightCm += item.heightCm;
    if (!item.exact) exact = false;
  }

  return {
    weightG,
    lengthCm,
    widthCm,
    heightCm: Math.min(heightCm, PRODUCT_DIMENSION_CM_MAX),
    exact,
  };
}
