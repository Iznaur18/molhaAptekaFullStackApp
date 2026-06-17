import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { invalidateAllProductCategoryDisplayQueries } from "../../../entities/product-category-display/lib/productCategoryDisplayQueryCache.js";
import { invalidateDataConfirmationStatus } from "../../../entities/user-data-confirmation/lib/dataConfirmationQueryCache.js";
import { invalidatePendingDataConfirmationRequests } from "../../../entities/user-data-confirmation/lib/pendingDataConfirmationQueryCache.js";
import { invalidateLoyaltyPointsStatus } from "../../../entities/user/lib/loyaltyPointsQueryCache.js";
import { invalidatePremiumStatus } from "../../../entities/user/lib/premiumQueryCache.js";
import { invalidateUsersSearch } from "../../../entities/user/lib/usersSearchQueryCache.js";
import { syncUserProfileActionCaches } from "../lib/staffBadgeQueryCache.js";

export function useHomeQueryRefreshers() {
  const queryClient = useQueryClient();

  const refreshUsersList = useCallback(async () => {
    await invalidateUsersSearch(queryClient);
  }, [queryClient]);

  const refreshDataConfirmationStatus = useCallback(async () => {
    await invalidateDataConfirmationStatus(queryClient);
  }, [queryClient]);

  const refreshPremiumAndLoyaltyStatus = useCallback(async () => {
    await Promise.all([
      invalidatePremiumStatus(queryClient),
      invalidateLoyaltyPointsStatus(queryClient),
    ]);
  }, [queryClient]);

  const refreshUserProfileActions = useCallback(async () => {
    await syncUserProfileActionCaches(queryClient);
  }, [queryClient]);

  const refreshPendingDataConfirmationQueue = useCallback(async () => {
    await invalidatePendingDataConfirmationRequests(queryClient);
  }, [queryClient]);

  const refreshCatalogBrowserDisplays = useCallback(async () => {
    await invalidateAllProductCategoryDisplayQueries(queryClient);
  }, [queryClient]);

  return {
    refreshUsersList,
    refreshDataConfirmationStatus,
    refreshPremiumAndLoyaltyStatus,
    refreshUserProfileActions,
    refreshPendingDataConfirmationQueue,
    refreshCatalogBrowserDisplays,
  };
}
