/**
 * @param {unknown} product
 * @returns {{ enabled: boolean; percent: number }}
 */
export function resolveProductAffiliateOffer(product) {
  const enabled = product?.affiliateEnabled === true;
  const percent = Math.floor(Number(product?.affiliatePercent) || 0);
  if (!enabled || percent <= 0) {
    return { enabled: false, percent: 0 };
  }
  return { enabled: true, percent };
}
