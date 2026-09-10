import {
  applyPromoReturnStreakDiscount,
  getPromoReturnStreakDiscountPercent,
  PROMO_RETURN_STREAK_DISCOUNT_PERCENT_BY_DAY,
  PROMO_RETURN_STREAK_MAX_DAY,
  PROMO_RETURN_STREAK_SERVICE_KINDS,
  PROMO_RETURN_STREAK_TIME_ZONE,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";

export {
  applyPromoReturnStreakDiscount,
  getPromoReturnStreakDiscountPercent,
  PROMO_RETURN_STREAK_DISCOUNT_PERCENT_BY_DAY,
  PROMO_RETURN_STREAK_MAX_DAY,
  PROMO_RETURN_STREAK_SERVICE_KINDS,
  PROMO_RETURN_STREAK_TIME_ZONE,
};

const STREAK_SELECT = "promoReturnStreakDay promoReturnStreakLastClaimDate";

/**
 * @param {Date} [now]
 * @returns {string} YYYY-MM-DD Europe/Moscow
 */
export function getMoscowCalendarDateString(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PROMO_RETURN_STREAK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * @param {string} ymd YYYY-MM-DD
 * @returns {string}
 */
export function getPreviousMoscowCalendarDateString(ymd) {
  const [year, month, day] = String(ymd)
    .split("-")
    .map((part) => Number(part));
  // Полдень UTC — безопасный якорь: сдвиг на сутки не ломает календарь МСК.
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  utcNoon.setUTCDate(utcNoon.getUTCDate() - 1);
  return getMoscowCalendarDateString(utcNoon);
}

/**
 * @param {{
 *   promoReturnStreakDay?: unknown;
 *   promoReturnStreakLastClaimDate?: unknown;
 * } | null | undefined} user
 * @param {Date} [now]
 */
export function resolvePromoReturnStreakState(user, now = new Date()) {
  const today = getMoscowCalendarDateString(now);
  const yesterday = getPreviousMoscowCalendarDateString(today);
  const lastClaim = String(user?.promoReturnStreakLastClaimDate ?? "").trim();
  const storedDay = Math.max(
    0,
    Math.min(
      PROMO_RETURN_STREAK_MAX_DAY,
      Math.floor(Number(user?.promoReturnStreakDay) || 0),
    ),
  );

  if (lastClaim === today) {
    if (storedDay > 0) {
      const discountPercent = getPromoReturnStreakDiscountPercent(storedDay);
      const tomorrowPercent =
        storedDay >= PROMO_RETURN_STREAK_MAX_DAY
          ? getPromoReturnStreakDiscountPercent(1)
          : getPromoReturnStreakDiscountPercent(storedDay + 1);
      return {
        day: storedDay,
        discountPercent,
        displayDay: storedDay,
        displayDiscountPercent: discountPercent,
        canClaim: false,
        claimedToday: true,
        tomorrowDiscountPercent: tomorrowPercent,
        today,
      };
    }

    // Скидку сегодня уже забрали и потратили на услугу — повторный claim
    // в тот же календарный день закрыт.
    return {
      day: 0,
      discountPercent: 0,
      displayDay: 1,
      displayDiscountPercent: getPromoReturnStreakDiscountPercent(1),
      canClaim: false,
      claimedToday: true,
      tomorrowDiscountPercent: getPromoReturnStreakDiscountPercent(1),
      today,
    };
  }

  // Утро 8-го дня после серии из 7: даже без пропуска стартуем заново.
  if (lastClaim === yesterday && storedDay >= PROMO_RETURN_STREAK_MAX_DAY) {
    return toClaimableStreakState({ nextClaimDay: 1, today });
  }

  if (lastClaim === yesterday && storedDay > 0) {
    return toClaimableStreakState({
      nextClaimDay: storedDay + 1,
      today,
      storedDay,
    });
  }

  // Пропуск / никогда не забирали / обнулили после оплаты.
  return toClaimableStreakState({ nextClaimDay: 1, today });
}

/**
 * @param {{
 *   nextClaimDay: number;
 *   today: string;
 *   storedDay?: number;
 * }} input
 */
function toClaimableStreakState({ nextClaimDay, today, storedDay = 0 }) {
  const claimDay = Math.min(PROMO_RETURN_STREAK_MAX_DAY, Math.max(1, nextClaimDay));
  const claimPercent = getPromoReturnStreakDiscountPercent(claimDay);
  const tomorrowDay = claimDay >= PROMO_RETURN_STREAK_MAX_DAY ? 1 : claimDay + 1;
  return {
    day: storedDay,
    discountPercent: 0,
    displayDay: claimDay,
    displayDiscountPercent: claimPercent,
    canClaim: true,
    claimedToday: false,
    tomorrowDiscountPercent: getPromoReturnStreakDiscountPercent(tomorrowDay),
    nextClaimDay: claimDay,
    today,
  };
}

/**
 * @param {string} userId
 * @param {Date} [now]
 */
export async function getPromoReturnStreakForUser(userId, now = new Date()) {
  const user = await UserModel.findById(userId).select(STREAK_SELECT).lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }
  return resolvePromoReturnStreakState(user, now);
}

/**
 * @param {string} userId
 * @param {Date} [now]
 */
export async function claimPromoReturnStreakDay(userId, now = new Date()) {
  const user = await UserModel.findById(userId).select(STREAK_SELECT).lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const state = resolvePromoReturnStreakState(user, now);
  if (!state.canClaim) {
    throw new AppError(409, "Скидку за сегодня уже забрали");
  }

  const nextDay = state.nextClaimDay ?? 1;
  const today = state.today;

  const updated = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { promoReturnStreakLastClaimDate: { $ne: today } },
        { promoReturnStreakLastClaimDate: null },
        { promoReturnStreakLastClaimDate: { $exists: false } },
      ],
    },
    {
      $set: {
        promoReturnStreakDay: nextDay,
        promoReturnStreakLastClaimDate: today,
      },
    },
    { returnDocument: "after" },
  )
    .select(STREAK_SELECT)
    .lean();

  if (!updated) {
    throw new AppError(409, "Скидку за сегодня уже забрали");
  }

  return resolvePromoReturnStreakState(updated, now);
}

/**
 * Активный % скидки (только если день уже забран сегодня).
 *
 * @param {string} userId
 * @param {import("mongoose").ClientSession | null} [session]
 * @param {Date} [now]
 */
export async function loadActivePromoReturnStreakDiscountPercent(
  userId,
  session = null,
  now = new Date(),
) {
  const query = UserModel.findById(userId).select(STREAK_SELECT);
  if (session) {
    query.session(session);
  }
  const user = await query.lean();
  if (!user) {
    return 0;
  }
  return resolvePromoReturnStreakState(user, now).discountPercent;
}

/**
 * Обнулить streak после применения скидки к оплате.
 *
 * @param {{
 *   userId: string;
 *   session?: import("mongoose").ClientSession | null;
 *   now?: Date;
 * }} input
 */
export async function consumePromoReturnStreakDiscount({
  userId,
  session = null,
  now = new Date(),
}) {
  const today = getMoscowCalendarDateString(now);
  await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        promoReturnStreakDay: 0,
        promoReturnStreakLastClaimDate: today,
      },
    },
    session ? { session } : {},
  );
}

/**
 * @param {{
 *   userId: string;
 *   amount: number;
 *   session?: import("mongoose").ClientSession | null;
 *   now?: Date;
 * }} input
 * @returns {Promise<{ amount: number; discountPercent: number; didConsume: boolean }>}
 */
export async function quoteAndConsumePromoReturnStreakAmount({
  userId,
  amount,
  session = null,
  now = new Date(),
}) {
  const base = Math.ceil(Number(amount));
  if (!Number.isFinite(base) || base <= 0) {
    return { amount: 0, discountPercent: 0, didConsume: false };
  }

  const today = getMoscowCalendarDateString(now);
  const query = UserModel.findOneAndUpdate(
    {
      _id: userId,
      promoReturnStreakDay: { $gt: 0 },
      promoReturnStreakLastClaimDate: today,
    },
    {
      $set: {
        promoReturnStreakDay: 0,
        promoReturnStreakLastClaimDate: today,
      },
    },
    {
      returnDocument: "before",
      ...(session ? { session } : {}),
    },
  );
  const prior = await query.select(STREAK_SELECT).lean();
  if (!prior) {
    return { amount: base, discountPercent: 0, didConsume: false };
  }

  const discountPercent = getPromoReturnStreakDiscountPercent(
    prior.promoReturnStreakDay,
  );
  if (discountPercent <= 0) {
    return { amount: base, discountPercent: 0, didConsume: false };
  }

  return {
    amount: applyPromoReturnStreakDiscount(base, discountPercent),
    discountPercent,
    didConsume: true,
  };
}
