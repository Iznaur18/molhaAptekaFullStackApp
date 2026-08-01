/**
 * Payout for one confirmed unit (same formula as server settle).
 * @param {unknown} linePaidTotal
 * @param {unknown} percent
 */
export function computeAffiliatePayoutAmount(
  linePaidTotal: unknown,
  percent: unknown,
): number {
  const paid = Math.floor(Number(linePaidTotal));
  const pct = Math.floor(Number(percent));
  if (!Number.isFinite(paid) || paid <= 0 || !Number.isFinite(pct) || pct <= 0) {
    return 0;
  }
  return Math.floor((paid * pct) / 100);
}

/**
 * Free loyalty = balance − reserved (not catalog commit).
 * @param {unknown} loyaltyPointsBalance
 * @param {unknown} loyaltyPointsReserved
 */
export function getAffiliateEnableAvailableLoyaltyPoints(
  loyaltyPointsBalance: unknown,
  loyaltyPointsReserved: unknown = 0,
): number {
  const total = Number(loyaltyPointsBalance) || 0;
  const reserved = Number(loyaltyPointsReserved) || 0;
  return Math.max(0, total - reserved);
}

/**
 * @param {number} required
 * @param {number} available
 */
export function formatAffiliateEnableInsufficientLoyaltyMessage(
  required: number,
  available: number,
): string {
  return `Недостаточно баллов для партнёрки. Нужно ${required}, свободно ${available}. Пополните баллы.`;
}

export type AffiliateEnableLoyaltyGateOk = {
  ok: true;
  required: number;
  available: number;
};

export type AffiliateEnableLoyaltyGateFail = {
  ok: false;
  required: number;
  available: number;
  message: string;
};

/**
 * Gate for turning affiliate ON (1 unit at product price × %).
 */
export function resolveAffiliateEnableLoyaltyGate(input: {
  productPrice: unknown;
  affiliatePercent: unknown;
  loyaltyPointsBalance: unknown;
  loyaltyPointsReserved?: unknown;
}): AffiliateEnableLoyaltyGateOk | AffiliateEnableLoyaltyGateFail {
  const required = computeAffiliatePayoutAmount(
    input.productPrice,
    input.affiliatePercent,
  );
  const available = getAffiliateEnableAvailableLoyaltyPoints(
    input.loyaltyPointsBalance,
    input.loyaltyPointsReserved,
  );
  if (required <= 0 || available >= required) {
    return { ok: true, required, available };
  }
  return {
    ok: false,
    required,
    available,
    message: formatAffiliateEnableInsufficientLoyaltyMessage(required, available),
  };
}
