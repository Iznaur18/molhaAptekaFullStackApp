import { z } from "zod";

import {
  getZonedWeekdayAndMinutes,
  parseBusinessHoursMinutes,
  resolveRuRegionIanaTimeZone,
} from "./ruRegionTimeZones.js";
import { DEFAULT_VIEWER_REGION_CODE } from "./ruRegions.js";

/** 0 = понедельник … 6 = воскресенье (ISO). */
export const USER_BUSINESS_HOURS_WEEKDAY_MIN = 0;
export const USER_BUSINESS_HOURS_WEEKDAY_MAX = 6;

export const USER_BUSINESS_HOURS_WEEKDAY_LABELS_RU = Object.freeze([
  "Пн",
  "Вт",
  "Ср",
  "Чт",
  "Пт",
  "Сб",
  "Вс",
]);

export const USER_SELLER_CLOSED_MESSAGE = "У нас закрыто";

export const SELLER_CLOSED_UNTIL_PREFIX = "Закрыто до";

export const SELLER_CLOSED_FALLBACK_OVERLAY = "Закрыто";

const businessHoursTimeSchema = z
  .string()
  .trim()
  .regex(/^\d{1,2}:\d{2}$/, "Время: ЧЧ:ММ");

export const userBusinessHoursScheduleSchema = z
  .object({
    weekdays: z
      .array(
        z
          .number()
          .int()
          .min(USER_BUSINESS_HOURS_WEEKDAY_MIN)
          .max(USER_BUSINESS_HOURS_WEEKDAY_MAX),
      )
      .min(1, "Выберите хотя бы один рабочий день"),
    openTime: businessHoursTimeSchema,
    closeTime: businessHoursTimeSchema,
  })
  .superRefine((value, ctx) => {
    const openMinutes = parseBusinessHoursMinutes(value.openTime);
    const closeMinutes = parseBusinessHoursMinutes(value.closeTime);
    if (openMinutes == null || closeMinutes == null) {
      return;
    }
    if (closeMinutes <= openMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Время закрытия должно быть позже времени открытия",
        path: ["closeTime"],
      });
    }
  });

export const userBusinessHoursBodySchema = z
  .union([userBusinessHoursScheduleSchema, z.null()])
  .optional();

/**
 * @param {unknown} schedule
 * @param {string | null | undefined} regionCode
 * @param {Date} [at]
 * @returns {boolean}
 */
/**
 * @param {unknown} schedule
 * @returns {{ weekdays: number[]; openMinutes: number; closeMinutes: number; openTime: string } | null}
 */
function normalizeSellerBusinessHoursSchedule(schedule) {
  if (schedule == null || typeof schedule !== "object" || schedule.enabled !== true) {
    return null;
  }

  const weekdays = Array.isArray(schedule.weekdays)
    ? [
        ...new Set(
          schedule.weekdays
            .map((day) => Number(day))
            .filter(
              (day) =>
                Number.isInteger(day) &&
                day >= USER_BUSINESS_HOURS_WEEKDAY_MIN &&
                day <= USER_BUSINESS_HOURS_WEEKDAY_MAX,
            ),
        ),
      ].sort((left, right) => left - right)
    : [];
  if (weekdays.length === 0) {
    return null;
  }

  const openTime = String(schedule.openTime ?? "").trim();
  const closeTime = String(schedule.closeTime ?? "").trim();
  const openMinutes = parseBusinessHoursMinutes(openTime);
  const closeMinutes = parseBusinessHoursMinutes(closeTime);
  if (openMinutes == null || closeMinutes == null || closeMinutes <= openMinutes) {
    return null;
  }

  return { weekdays, openMinutes, closeMinutes, openTime };
}

/**
 * @param {unknown} schedule
 * @param {string | null | undefined} regionCode
 * @param {Date} [at]
 * @returns {boolean}
 */
export function isSellerScheduleClosedNow(schedule, regionCode, at = new Date()) {
  const normalized = normalizeSellerBusinessHoursSchedule(schedule);
  if (normalized == null) {
    return false;
  }

  const timeZone = resolveRuRegionIanaTimeZone(
    String(regionCode ?? "").trim() || DEFAULT_VIEWER_REGION_CODE,
  );
  const { weekday, minutes } = getZonedWeekdayAndMinutes(at, timeZone);
  if (!normalized.weekdays.includes(weekday)) {
    return true;
  }
  return minutes < normalized.openMinutes || minutes >= normalized.closeMinutes;
}

/**
 * Время следующего открытия (ЧЧ:ММ в TZ продавца), если сейчас закрыто.
 *
 * @param {unknown} schedule
 * @param {string | null | undefined} regionCode
 * @param {Date} [at]
 * @returns {string | null}
 */
export function resolveSellerScheduleOpensAtTime(schedule, regionCode, at = new Date()) {
  const normalized = normalizeSellerBusinessHoursSchedule(schedule);
  if (normalized == null) {
    return null;
  }
  if (!isSellerScheduleClosedNow(schedule, regionCode, at)) {
    return null;
  }

  const timeZone = resolveRuRegionIanaTimeZone(
    String(regionCode ?? "").trim() || DEFAULT_VIEWER_REGION_CODE,
  );
  const { weekday, minutes } = getZonedWeekdayAndMinutes(at, timeZone);

  if (normalized.weekdays.includes(weekday) && minutes < normalized.openMinutes) {
    return normalized.openTime;
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const nextWeekday = (weekday + offset) % 7;
    if (normalized.weekdays.includes(nextWeekday)) {
      return normalized.openTime;
    }
  }

  return null;
}

/**
 * @param {string | null | undefined} opensAtTime
 * @returns {string}
 */
export function formatSellerClosedUntilLabel(opensAtTime) {
  const trimmed = String(opensAtTime ?? "").trim();
  if (!trimmed) {
    return SELLER_CLOSED_FALLBACK_OVERLAY;
  }
  return `${SELLER_CLOSED_UNTIL_PREFIX} ${trimmed}`;
}

/**
 * @param {unknown} user
 * @returns {string | null}
 */
export function formatUserBusinessHoursForProfile(user) {
  if (user == null || typeof user !== "object" || user.userBusinessHoursEnabled !== true) {
    return null;
  }

  const schedule = user.userBusinessHours;
  if (schedule == null || typeof schedule !== "object") {
    return null;
  }

  const weekdays = Array.isArray(schedule.weekdays)
    ? [
        ...new Set(
          schedule.weekdays
            .map((day) => Number(day))
            .filter(
              (day) =>
                Number.isInteger(day) &&
                day >= USER_BUSINESS_HOURS_WEEKDAY_MIN &&
                day <= USER_BUSINESS_HOURS_WEEKDAY_MAX,
            ),
        ),
      ].sort((left, right) => left - right)
    : [];
  if (weekdays.length === 0) {
    return null;
  }

  const openTime = String(schedule.openTime ?? "").trim();
  const closeTime = String(schedule.closeTime ?? "").trim();
  if (!openTime || !closeTime) {
    return null;
  }

  const dayPart = weekdays
    .map((day) => USER_BUSINESS_HOURS_WEEKDAY_LABELS_RU[day])
    .filter(Boolean)
    .join(", ");

  return `${dayPart}, ${openTime}–${closeTime}`;
}

/**
 * @param {unknown} user
 * @param {Date} [at]
 * @returns {boolean}
 */
export function isUserSellerClosedNow(user, at = new Date()) {
  if (user == null || typeof user !== "object") {
    return false;
  }
  return isSellerScheduleClosedNow(
    {
      enabled: user.userBusinessHoursEnabled === true,
      weekdays: user.userBusinessHours?.weekdays,
      openTime: user.userBusinessHours?.openTime,
      closeTime: user.userBusinessHours?.closeTime,
    },
    user.userRegionCode,
    at,
  );
}

/**
 * @param {unknown} product
 * @returns {boolean}
 */
export function isProductSellerClosedNow(product) {
  return product != null && typeof product === "object" && product.isSellerClosedNow === true;
}
