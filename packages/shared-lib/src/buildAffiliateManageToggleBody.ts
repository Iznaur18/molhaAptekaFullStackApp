/** Default % prefilled in affiliate settings modal. */
export const AFFILIATE_MANAGE_DEFAULT_PERCENT = 10;

export const AFFILIATE_PERCENT_MIN = 1;
export const AFFILIATE_PERCENT_MAX = 50;

type AffiliatePercentSource = {
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
