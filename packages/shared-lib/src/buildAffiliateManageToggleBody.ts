/** Default % prefilled in affiliate settings modal. */
export const AFFILIATE_MANAGE_DEFAULT_PERCENT = 10;

export const AFFILIATE_PERCENT_MIN = 1;
export const AFFILIATE_PERCENT_MAX = 50;

type AffiliatePercentSource = {
  _id?: unknown;
  affiliatePercent?: unknown;
} | null | undefined;

/** True when listing has a valid sharer payout %. */
export function isProductAffiliateConfigured(
  product: AffiliatePercentSource,
): boolean {
  const percent = Math.floor(Number(product?.affiliatePercent) || 0);
  return (
    Number.isFinite(percent) &&
    percent >= AFFILIATE_PERCENT_MIN &&
    percent <= AFFILIATE_PERCENT_MAX
  );
}

/**
 * Первый кандидат с matching `_id` (hint из UI → promotion → edit).
 */
export function resolveAffiliateToggleSourceProduct(
  productId: string,
  candidates: readonly AffiliatePercentSource[],
): AffiliatePercentSource {
  const normalized = String(productId ?? "").trim();
  if (!normalized) {
    return null;
  }
  for (const candidate of candidates) {
    if (candidate && String(candidate._id ?? "") === normalized) {
      return candidate;
    }
  }
  return null;
}

/**
 * Body for manage-panel affiliate on/off toggle.
 * Enable requires configured % (caller opens settings modal otherwise).
 */
export function buildAffiliateManageToggleBody(
  product: AffiliatePercentSource,
  enabled: boolean,
): { affiliateEnabled: boolean; affiliatePercent?: number } {
  if (!enabled) {
    return { affiliateEnabled: false };
  }
  const existing = Math.floor(Number(product?.affiliatePercent) || 0);
  return {
    affiliateEnabled: true,
    affiliatePercent: existing,
  };
}
