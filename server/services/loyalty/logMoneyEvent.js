import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";

/**
 * Ops-события денежных операций (`money.*`). Без email/phone/token.
 *
 * @param {'info' | 'warn' | 'error'} level
 * @param {string} action snake_case без префикса money. (например `loyalty_reserve`)
 * @param {Record<string, unknown>} [fields]
 */
export function logMoneyEvent(level, action, fields = {}) {
  logServerEvent(level, {
    event: `money.${action}`,
    ...fields,
  });
}

/**
 * @param {unknown} error
 * @returns {'warn' | 'error'}
 */
export function resolveMoneyFailureLevel(error) {
  const name = error instanceof Error ? error.name : "";
  if (
    name === "InsufficientLoyaltyPointsError" ||
    name === "InsufficientRubBalanceError" ||
    name === "PremiumAlreadyActiveError"
  ) {
    return "warn";
  }
  if (error && typeof error === "object" && "statusCode" in error) {
    const status = Number(/** @type {{ statusCode?: number }} */ (error).statusCode);
    if (status >= 400 && status < 500) {
      return "warn";
    }
  }
  return "error";
}

/**
 * @param {string} action
 * @param {Record<string, unknown>} fields
 * @param {unknown} error
 */
export function logMoneyFailure(action, fields, error) {
  logMoneyEvent(resolveMoneyFailureLevel(error), `${action}_failed`, {
    ...fields,
    ...formatLogError(error),
  });
}
