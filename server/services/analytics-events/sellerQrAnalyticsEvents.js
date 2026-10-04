import { SELLER_QR_STATS_RECENT_DAYS } from "@molha/api-contract";

import { ANALYTICS_EVENT_SELLER_QR_SCANNED } from "../../constants/analyticsEventConstants.js";
import { AnalyticsEventModel } from "../../models/index.js";
import { toUtcDayKey } from "./funnelAnalyticsEvents.js";
import { enqueueAnalyticsEvent } from "./insertAnalyticsEventIdempotent.js";

const SUBJECT_TYPE = "seller";
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Переход на витрину по QR-коду. Один посетитель у одного продавца считается
 * раз в сутки: обновление страницы и повторное наведение камеры не накручивают
 * счётчик. Свои же переходы продавца не считаем.
 *
 * @param {{
 *   sellerId: string;
 *   visitorId: string;
 *   actorUserId?: string | null;
 *   now?: Date;
 * }} params
 * @returns {boolean} true — событие поставлено в очередь
 */
export function emitSellerQrScannedEvent({
  sellerId,
  visitorId,
  actorUserId = null,
  now = new Date(),
}) {
  const seller = String(sellerId);
  const actor = actorUserId ? String(actorUserId) : null;
  if (actor && actor === seller) {
    return false;
  }

  // Вошедшего узнаём по аккаунту, гостя — по случайному id его браузера.
  const visitorPart = actor ? `u:${actor}` : `v:${visitorId}`;
  enqueueAnalyticsEvent({
    eventType: ANALYTICS_EVENT_SELLER_QR_SCANNED,
    idempotencyKey: `${ANALYTICS_EVENT_SELLER_QR_SCANNED}:${seller}:${visitorPart}:${toUtcDayKey(now)}`,
    occurredAt: now,
    actorUserId: actor,
    subjectType: SUBJECT_TYPE,
    subjectId: seller,
    payload: {},
  });
  return true;
}

/**
 * Сколько раз открывали витрину по QR-коду: всего и за последние дни.
 *
 * @param {{ sellerId: string; now?: Date }} params
 */
export async function getSellerQrScanStats({ sellerId, now = new Date() }) {
  const filter = {
    eventType: ANALYTICS_EVENT_SELLER_QR_SCANNED,
    subjectId: String(sellerId),
  };
  const [total, recent] = await Promise.all([
    AnalyticsEventModel.countDocuments(filter),
    AnalyticsEventModel.countDocuments({
      ...filter,
      occurredAt: {
        $gte: new Date(now.getTime() - SELLER_QR_STATS_RECENT_DAYS * DAY_MS),
      },
    }),
  ]);

  return { total, recent, recentDays: SELLER_QR_STATS_RECENT_DAYS };
}
