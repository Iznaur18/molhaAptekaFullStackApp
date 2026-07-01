type ProductPromoteButtonDisabledParams = {
  isDeletePending?: boolean;
  isAvailabilityTogglePending?: boolean;
  isAuctionTogglePending?: boolean;
};

export const isProductPromoteButtonDisabled = ({
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
}: ProductPromoteButtonDisabledParams): boolean =>
  isDeletePending || isAvailabilityTogglePending || isAuctionTogglePending;
