import { randomUUID } from "node:crypto";

import {
  ANALYTICS_EVENT_CART_ITEM_ADDED,
  ANALYTICS_EVENT_CHECKOUT_STARTED,
  ANALYTICS_EVENT_PAYMENT_SUCCEEDED,
  ANALYTICS_EVENT_PRODUCT_PUBLISHED,
  ANALYTICS_EVENT_SEARCH_PERFORMED,
  ANALYTICS_EVENT_USER_ACTIVE,
  ANALYTICS_SEARCH_QUERY_MAX,
  ANALYTICS_USER_ACTIVE_CACHE_MAX,
} from "../../constants/analyticsEventConstants.js";
import { enqueueAnalyticsEvent } from "./insertAnalyticsEventIdempotent.js";

/**
 * События воронки и удержания. Все fire-and-forget: сбой записи попадает в
 * лог, а не в ответ пользователю. Персональных данных в payload нет.
 */

/** @param {Date} [date] */
export const toUtcDayKey = (date = new Date()) => date.toISOString().slice(0, 10);

/**
 * Номер телефона или карты в поиске не храним: пять и больше цифр подряд
 * (с пробелами и дефисами) — запрос пишется без текста.
 * @param {string} query
 */
const looksLikePersonalData = (query) =>
  /(?:\d[\s-]?){5,}/.test(query) || query.includes("@");

/**
 * @param {unknown} rawQuery
 * @returns {string}
 */
export function normalizeSearchQueryForAnalytics(rawQuery) {
  const query = String(rawQuery ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .slice(0, ANALYTICS_SEARCH_QUERY_MAX);
  return looksLikePersonalData(query) ? "" : query;
}

/**
 * Поиск с первой страницы. Ключ случайный: одинаковые запросы — разные поиски.
 *
 * @param {{
 *   userId?: string | null;
 *   query: unknown;
 *   resultCount: number;
 *   near?: boolean;
 * }} params
 */
export function emitSearchPerformedEvent({
  userId = null,
  query,
  resultCount,
  near = false,
}) {
  const normalized = normalizeSearchQueryForAnalytics(query);
  const total = Math.max(0, Math.floor(Number(resultCount) || 0));
  enqueueAnalyticsEvent({
    eventType: ANALYTICS_EVENT_SEARCH_PERFORMED,
    idempotencyKey: `search.performed:${randomUUID()}`,
    actorUserId: userId ? String(userId) : null,
    subjectType: "search",
    subjectId: null,
    payload: {
      query: normalized,
      queryLength: String(query ?? "").trim().length,
      resultCount: total,
      hasResults: total > 0,
      near: near === true,
    },
  });
}

/**
 * Товары, которых не было в корзине до сохранения. Один товар учитывается
 * у пользователя не чаще раза в сутки.
 *
 * @param {{ userId: string; productIds: string[]; now?: Date }} params
 */
export function emitCartItemsAddedEvents({ userId, productIds, now = new Date() }) {
  const day = toUtcDayKey(now);
  for (const productId of new Set(productIds.map(String))) {
    enqueueAnalyticsEvent({
      eventType: ANALYTICS_EVENT_CART_ITEM_ADDED,
      idempotencyKey: `cart.item_added:${userId}:${productId}:${day}`,
      occurredAt: now,
      actorUserId: String(userId),
      subjectType: "product",
      subjectId: productId,
      payload: {},
    });
  }
}

/**
 * Покупатель открыл оформление заказа. Для воронки достаточно одного раза в сутки.
 *
 * @param {{ userId: string; platform?: string; now?: Date }} params
 */
export function emitCheckoutStartedEvent({
  userId,
  platform = "web",
  now = new Date(),
}) {
  enqueueAnalyticsEvent({
    eventType: ANALYTICS_EVENT_CHECKOUT_STARTED,
    idempotencyKey: `checkout.started:${userId}:${toUtcDayKey(now)}`,
    occurredAt: now,
    actorUserId: String(userId),
    subjectType: "user",
    subjectId: String(userId),
    payload: { platform },
  });
}

/**
 * Деньги пришли и зачтены (после `apply*` с `applied: true`).
 *
 * @param {{
 *   paymentId: string;
 *   userId?: string | null;
 *   purpose: string;
 *   amountRub: number;
 *   orderId?: string | null;
 * }} params
 */
export function emitPaymentSucceededEvent({
  paymentId,
  userId = null,
  purpose,
  amountRub,
  orderId = null,
}) {
  enqueueAnalyticsEvent({
    eventType: ANALYTICS_EVENT_PAYMENT_SUCCEEDED,
    idempotencyKey: `payment.succeeded:${paymentId}`,
    actorUserId: userId ? String(userId) : null,
    subjectType: orderId ? "order" : "payment",
    subjectId: orderId ? String(orderId) : String(paymentId),
    payload: {
      purpose,
      amountRub: Number(amountRub) || 0,
      paymentId: String(paymentId),
    },
  });
}

/**
 * Товар впервые стал виден покупателям (прошёл модерацию или не требовал её).
 *
 * @param {{ productId: string; sellerId: string; autoApproved?: boolean }} params
 */
export function emitProductPublishedEvent({
  productId,
  sellerId,
  autoApproved = false,
}) {
  enqueueAnalyticsEvent({
    eventType: ANALYTICS_EVENT_PRODUCT_PUBLISHED,
    idempotencyKey: `seller.product_published:${productId}`,
    actorUserId: String(sellerId),
    subjectType: "product",
    subjectId: String(productId),
    payload: { autoApproved: autoApproved === true },
  });
}

/** Кто уже отмечен сегодня в этом процессе — чтобы не писать в базу на каждый запрос. */
let activeDay = "";
/** @type {Set<string>} */
const activeUserIds = new Set();

/**
 * Первый авторизованный запрос пользователя за сутки (UTC) — основа
 * когорт удержания. Повторы в других процессах гасит уникальный ключ.
 *
 * @param {string} userId
 * @param {Date} [now]
 * @returns {boolean} true — событие поставлено в очередь
 */
export function trackUserActiveDay(userId, now = new Date()) {
  const id = String(userId ?? "");
  if (!id) {
    return false;
  }
  const day = toUtcDayKey(now);
  if (day !== activeDay || activeUserIds.size >= ANALYTICS_USER_ACTIVE_CACHE_MAX) {
    activeDay = day;
    activeUserIds.clear();
  }
  if (activeUserIds.has(id)) {
    return false;
  }
  activeUserIds.add(id);
  enqueueAnalyticsEvent({
    eventType: ANALYTICS_EVENT_USER_ACTIVE,
    idempotencyKey: `user.active:${id}:${day}`,
    occurredAt: now,
    actorUserId: id,
    subjectType: "user",
    subjectId: id,
    payload: { day },
  });
  return true;
}

/** Только для тестов. */
export function resetUserActiveDayCache() {
  activeDay = "";
  activeUserIds.clear();
}
