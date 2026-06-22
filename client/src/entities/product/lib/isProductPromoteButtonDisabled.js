/**
 * @param {{
 *   isDeletePending?: boolean;
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 * }} params
 */
export function isProductPromoteButtonDisabled({
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
}) {
  return isDeletePending || isAvailabilityTogglePending || isAuctionTogglePending;
}
