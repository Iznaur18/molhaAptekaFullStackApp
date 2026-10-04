import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

/**
 * QR-код витрины продавца ведёт на `/seller/:id?src=qr`. По метке клиент
 * понимает, что зашли именно по коду, и один раз сообщает об этом серверу.
 *
 * Метка — в query, а не в пути: напечатанный код должен открываться всегда,
 * даже если учёт переходов когда-нибудь уберут.
 */
export const SELLER_QR_SOURCE_PARAM = "src";
export const SELLER_QR_SOURCE_VALUE = "qr";

export const SELLER_QR_VISITOR_ID_MIN_LENGTH = 8;
export const SELLER_QR_VISITOR_ID_MAX_LENGTH = 64;

/** За сколько дней показываем «недавние» переходы. */
export const SELLER_QR_STATS_RECENT_DAYS = 30;

/**
 * Body `POST /analytics/track-seller-qr`.
 * `visitorId` — случайный id браузера: один посетитель за день считается раз.
 */
export const trackSellerQrScanBodySchema = z.object({
  sellerId: mongoIdSchema,
  visitorId: z
    .string()
    .trim()
    .min(SELLER_QR_VISITOR_ID_MIN_LENGTH)
    .max(SELLER_QR_VISITOR_ID_MAX_LENGTH)
    .regex(/^[A-Za-z0-9_-]+$/u),
});

/** `data` ответа `GET /analytics/seller-qr/me`. */
export const sellerQrStatsDataSchema = z.object({
  total: z.number().int().min(0),
  recent: z.number().int().min(0),
  recentDays: z.number().int().min(1),
});

/**
 * Путь витрины для QR-кода: тот же постоянный адрес плюс метка источника.
 *
 * @param {string} sellerId
 * @returns {string}
 */
export function buildSellerQrPath(sellerId) {
  return `/seller/${encodeURIComponent(String(sellerId))}?${SELLER_QR_SOURCE_PARAM}=${SELLER_QR_SOURCE_VALUE}`;
}
