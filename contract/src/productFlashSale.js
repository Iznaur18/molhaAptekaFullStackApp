import { z } from "zod";

export const PRODUCT_FLASH_SALE_MAX_DISCOUNT_PERCENT = 90;
export const PRODUCT_FLASH_SALE_DURATION_MIN_MINUTES = 1;
export const PRODUCT_FLASH_SALE_DURATION_MAX_MINUTES = 7 * 24 * 60;

export const PRODUCT_FLASH_SALE_DURATION_UNITS = ["minutes", "hours", "days"];

export const PRODUCT_FLASH_SALE_AUCTION_BLOCKED_MESSAGE =
  "Отключите аукцион, чтобы включить горящую скидку";
export const PRODUCT_FLASH_SALE_MANUAL_DISCOUNT_BLOCKED_MESSAGE =
  "Сначала уберите ручную скидку (старую цену)";
export const PRODUCT_FLASH_SALE_PRICE_REQUIRED_MESSAGE =
  "Укажите цену со скидкой";
export const PRODUCT_FLASH_SALE_PRICE_TOO_HIGH_MESSAGE =
  "Цена со скидкой должна быть меньше обычной";
export const PRODUCT_FLASH_SALE_MAX_DISCOUNT_MESSAGE = `Скидка не более ${PRODUCT_FLASH_SALE_MAX_DISCOUNT_PERCENT}%`;
export const PRODUCT_FLASH_SALE_DURATION_REQUIRED_MESSAGE =
  "Укажите длительность горящей скидки";
export const PRODUCT_FLASH_SALE_DURATION_RANGE_MESSAGE = `Длительность от ${PRODUCT_FLASH_SALE_DURATION_MIN_MINUTES} мин до 7 дней`;
export const PRODUCT_FLASH_SALE_CONFIG_REQUIRED_MESSAGE =
  "Сначала укажите цену и длительность горящей скидки";
export const PRODUCT_FLASH_SALE_ACTIVE_PRICE_LOCKED_MESSAGE =
  "Цену нельзя менять во время горящей скидки — измените её в настройках горящей скидки";

/**
 * @param {unknown} value
 * @param {unknown} unit
 * @returns {number | null}
 */
export const resolveProductFlashSaleDurationMinutes = (value, unit) => {
  const amount = Math.floor(Number(value));
  if (!Number.isFinite(amount) || amount < 1) {
    return null;
  }
  const normalizedUnit = String(unit ?? "minutes");
  if (normalizedUnit === "hours") {
    return amount * 60;
  }
  if (normalizedUnit === "days") {
    return amount * 24 * 60;
  }
  if (normalizedUnit === "minutes") {
    return amount;
  }
  return null;
};

/**
 * @param {number | null | undefined} endsAtMs
 * @param {number} [nowMs]
 */
export const isProductFlashSaleActiveAt = (endsAtMs, nowMs = Date.now()) => {
  const ends = endsAtMs == null ? null : Math.floor(Number(endsAtMs));
  if (ends == null || !Number.isFinite(ends)) {
    return false;
  }
  return ends > nowMs;
};

export const productFlashSaleDurationUnitSchema = z.enum(PRODUCT_FLASH_SALE_DURATION_UNITS);

export const productFlashSalePatchFieldsShape = {
  productFlashSaleEnabled: z.coerce.boolean().optional(),
  productFlashSalePrice: z.coerce.number().int().min(1).optional(),
  productFlashSaleDurationValue: z.coerce.number().int().min(1).optional(),
  productFlashSaleDurationUnit: productFlashSaleDurationUnitSchema.optional(),
};
