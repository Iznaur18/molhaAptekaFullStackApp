import { z } from "zod";

/**
 * Первое и последнее касание (UTM, click id, реферер), которые клиент копит
 * до регистрации и заказа. Поля объявлены явно: zod срезает необъявленные,
 * и без схемы атрибуция молча терялась бы на входе.
 * Нормализацию делает `sanitizeMarketingAttribution` из shared-lib.
 */
const marketingTouchField = z.string().trim().max(100).optional().default("");

export const marketingTouchSchema = z.object({
  source: z.string().trim().min(1).max(100),
  medium: marketingTouchField,
  campaign: marketingTouchField,
  content: marketingTouchField,
  term: marketingTouchField,
  clickId: marketingTouchField,
  referrerHost: marketingTouchField,
  landingPath: z.string().trim().max(200).optional().default(""),
  capturedAt: z.string().trim().min(1).max(40),
});

export const marketingAttributionSchema = z
  .object({
    firstTouch: marketingTouchSchema.nullable().optional().default(null),
    lastTouch: marketingTouchSchema.nullable().optional().default(null),
  })
  .nullable()
  .optional();

/** Клиентские события воронки, которые сервер сам не видит. */
export const ANALYTICS_CLIENT_EVENT_CHECKOUT_STARTED = "checkout.started";
export const ANALYTICS_CLIENT_EVENT_KINDS = [ANALYTICS_CLIENT_EVENT_CHECKOUT_STARTED];

export const trackClientAnalyticsBodySchema = z.object({
  kind: z.enum(ANALYTICS_CLIENT_EVENT_KINDS),
  platform: z.enum(["web", "ios", "android"]).optional().default("web"),
});
