/**
 * @param {{
 *   isActive?: boolean;
 *   canPurchase?: boolean;
 * } | null | undefined} status
 */
export function premiumNeedsAttention(status) {
  return !status?.isActive && status?.canPurchase === true;
}
