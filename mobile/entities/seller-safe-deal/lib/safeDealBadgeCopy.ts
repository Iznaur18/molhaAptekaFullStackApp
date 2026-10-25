import { SAFE_DEAL_BADGE_UI } from "@/shared/config";

/**
 * Заморозка денег в безопасной сделке (паритет web `isSafeDealEscrowEnabled.js`).
 *
 * `false` — платёжный сервис ещё не подключён: площадка подтверждает, что
 * продавец действительно ИП или ООО, но придержать деньги до доставки пока
 * нечем. Значок говорит только про проверку продавца — иначе покупателю
 * обещали бы защиту, которой нет. Включать вместе с сайтом.
 */
export const IS_SAFE_DEAL_ESCROW_ENABLED = false;

/** Подписи значка под текущее состояние площадки — одна точка на все места. */
export const resolveSafeDealBadgeCopy = () =>
  IS_SAFE_DEAL_ESCROW_ENABLED
    ? SAFE_DEAL_BADGE_UI.ESCROW
    : SAFE_DEAL_BADGE_UI.VERIFIED_ONLY;
