import { isProductFlashSaleActiveAt } from "@molha/api-contract";

/**
 * @param {import("../model/types.js").ProductFromApi | null | undefined} product
 * @param {number} [nowMs]
 */
export function isProductFlashSaleActive(product, nowMs = Date.now()) {
  if (product?.productFlashSaleEnabled !== true) {
    return false;
  }
  const endsAt = product.productFlashSaleEndsAt;
  if (endsAt == null) {
    return false;
  }
  const endsAtMs =
    endsAt instanceof Date
      ? endsAt.getTime()
      : Math.floor(new Date(String(endsAt)).getTime());
  return isProductFlashSaleActiveAt(endsAtMs, nowMs);
}

/**
 * @param {import("../model/types.js").ProductFromApi | null | undefined} product
 */
export function resolveProductFlashSaleEndsAtMs(product) {
  const endsAt = product?.productFlashSaleEndsAt;
  if (endsAt == null) {
    return null;
  }
  const ms =
    endsAt instanceof Date
      ? endsAt.getTime()
      : Math.floor(new Date(String(endsAt)).getTime());
  return Number.isFinite(ms) ? ms : null;
}

/**
 * @param {import("../model/types.js").ProductFromApi | null | undefined} product
 * @returns {number | null}
 */
export function resolveProductFlashSaleTotalDurationMs(product) {
  const minutes = Math.floor(Number(product?.productFlashSaleDurationMinutes));
  if (!Number.isFinite(minutes) || minutes < 1) {
    return null;
  }
  return minutes * 60 * 1000;
}

/**
 * @param {import("../model/types.js").ProductFromApi | null | undefined} product
 * @param {number} [nowMs]
 * @returns {number | null}
 */
export function resolveProductFlashSaleBorderProgress(product, nowMs = Date.now()) {
  const endsAtMs = resolveProductFlashSaleEndsAtMs(product);
  const totalMs = resolveProductFlashSaleTotalDurationMs(product);
  if (endsAtMs == null || totalMs == null) {
    return null;
  }

  const remainingMs = Math.max(0, endsAtMs - nowMs);
  return Math.max(0, Math.min(1, remainingMs / totalMs));
}

/**
 * @param {number} totalSeconds
 */
export function formatFlashSaleCountdown(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value) => String(value).padStart(2, "0");
  if (days > 0) {
    return `${days}д ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * @param {number} totalSeconds
 * @returns {{
 *   showDays: boolean;
 *   days: string | null;
 *   hours: string;
 *   minutes: string;
 *   seconds: string;
 * }}
 */
export function resolveFlashSaleCountdownParts(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value) => String(value).padStart(2, "0");

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
}

/**
 * @param {import("../model/types.js").ProductFromApi | null | undefined} product
 * @returns {number | null}
 */
export function resolveFlashSaleRestoreBasePrice(product) {
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
}

/**
 * Клиентская нормализация истёкшей горящей скидки (пока кэш React Query не обновился).
 *
 * @param {import("../model/types.js").ProductFromApi | null | undefined} product
 * @param {number} [nowMs]
 */
export function normalizeStaleFlashSaleProduct(product, nowMs = Date.now()) {
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
}
