/**
 * @param {{
 *   productIsAvailable?: boolean | null;
 *   isDeletePending?: boolean;
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 * }} params
 */
export function isProductPromoteButtonDisabled({
  productIsAvailable,
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
}) {
  return (
    productIsAvailable === false ||
    isDeletePending ||
    isAvailabilityTogglePending ||
    isAuctionTogglePending
  );
}
