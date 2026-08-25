import { isProductFlashSaleActiveAt } from "@molha/api-contract";

/**
 * Горящая скидка: порт `client/src/entities/product/lib/isProductFlashSaleActive.js`.
 *
 * Модуль намеренно без alias-импортов (только контракт), чтобы его можно было
 * гонять напрямую в `node --test` — см. scripts/flash-sale.test.mjs.
 */
/**
 * Индексная сигнатура обязательна: без неё TS считает тип «слабым» и не
 * принимает товар из каталога (`Record<string, unknown> & { _id: string }`).
 * Значимые поля: productFlashSaleEnabled, productFlashSaleEndsAt,
 * productFlashSaleBasePrice, productFlashSaleDurationMinutes, productOldPrice,
 * productPrice.
 */
type FlashSaleProduct = Record<string, unknown> | null | undefined;

export const resolveProductFlashSaleEndsAtMs = (
  product: FlashSaleProduct,
): number | null => {
  const endsAt = product?.productFlashSaleEndsAt;
  if (endsAt == null) {
    return null;
  }
  const ms =
    endsAt instanceof Date
      ? endsAt.getTime()
      : Math.floor(new Date(String(endsAt)).getTime());
  return Number.isFinite(ms) ? ms : null;
};

export const isProductFlashSaleActive = (
  product: FlashSaleProduct,
  nowMs: number = Date.now(),
): boolean => {
  if (product?.productFlashSaleEnabled !== true) {
    return false;
  }
  const endsAtMs = resolveProductFlashSaleEndsAtMs(product);
  if (endsAtMs == null) {
    return false;
  }
  return isProductFlashSaleActiveAt(endsAtMs, nowMs);
};

export const resolveProductFlashSaleTotalDurationMs = (
  product: FlashSaleProduct,
): number | null => {
  const minutes = Math.floor(Number(product?.productFlashSaleDurationMinutes));
  if (!Number.isFinite(minutes) || minutes < 1) {
    return null;
  }
  return minutes * 60 * 1000;
};

/** Доля оставшегося времени 0..1 — прогресс рамки вокруг иконки. */
export const resolveProductFlashSaleBorderProgress = (
  product: FlashSaleProduct,
  nowMs: number = Date.now(),
): number | null => {
  const endsAtMs = resolveProductFlashSaleEndsAtMs(product);
  const totalMs = resolveProductFlashSaleTotalDurationMs(product);
  if (endsAtMs == null || totalMs == null) {
    return null;
  }

  const remainingMs = Math.max(0, endsAtMs - nowMs);
  return Math.max(0, Math.min(1, remainingMs / totalMs));
};

const pad = (value: number): string => String(value).padStart(2, "0");

export const formatFlashSaleCountdown = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (days > 0) {
    return `${days}д ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export type FlashSaleCountdownParts = {
  showDays: boolean;
  days: string | null;
  hours: string;
  minutes: string;
  seconds: string;
};

export const resolveFlashSaleCountdownParts = (
  totalSeconds: number,
): FlashSaleCountdownParts => {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (days > 0) {
    return {
      showDays: true,
      days: String(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
    };
  }

  return {
    showDays: false,
    days: null,
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
};

/** Цена, к которой вернётся товар после отключения скидки. */
export const resolveFlashSaleRestoreBasePrice = (
  product: FlashSaleProduct,
): number | null => {
  const fromBase = Math.floor(Number(product?.productFlashSaleBasePrice));
  if (Number.isFinite(fromBase) && fromBase > 0) {
    return fromBase;
  }
  const fromOld = Math.floor(Number(product?.productOldPrice));
  const current = Math.floor(Number(product?.productPrice));
  if (Number.isFinite(fromOld) && Number.isFinite(current) && fromOld > current) {
    return fromOld;
  }
  return null;
};

/**
 * Клиентская нормализация истёкшей скидки — пока кэш React Query не обновился,
 * товар не должен показывать перечёркнутую цену и бейдж.
 */
export const normalizeStaleFlashSaleProduct = <T extends FlashSaleProduct>(
  product: T,
  nowMs: number = Date.now(),
): T => {
  if (product == null || product.productFlashSaleEnabled !== true) {
    return product;
  }
  if (isProductFlashSaleActive(product, nowMs)) {
    return product;
  }
  if (resolveProductFlashSaleEndsAtMs(product) == null) {
    return product;
  }

  const restorePrice = resolveFlashSaleRestoreBasePrice(product);
  return {
    ...product,
    productFlashSaleEnabled: false,
    productFlashSaleEndsAt: null,
    productFlashSaleBasePrice: null,
    productFlashSaleDurationMinutes: null,
    productOldPrice: null,
    ...(restorePrice != null ? { productPrice: restorePrice } : {}),
  };
};
