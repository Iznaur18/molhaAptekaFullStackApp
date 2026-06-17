import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRaffleMutations } from "../../../entities/raffle/model/useRaffleMutations.js";
import { canSellerEditRaffle } from "../../../entities/raffle/lib/canSellerEditRaffle.js";
import {
  invalidateAllRaffleQueries,
  invalidateFeaturedRaffles,
} from "../../../entities/raffle/lib/raffleQueryCache.js";
import { useFeaturedRafflesQuery } from "../../../entities/raffle/model/useFeaturedRafflesQuery.js";
import { useMyRaffleQuery } from "../../../entities/raffle/model/useMyRaffleQuery.js";
import { invalidateUserStoriesFeed } from "../../../entities/user-story/lib/userStoriesQueryCache.js";
import { useUserStoriesFeedQuery } from "../../../entities/user-story/model/useUserStoriesFeedQuery.js";
import { API_CLIENT_UI, RAFFLE_MANAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   isHomeCatalogMainView: boolean;
 *   isAuthorized: boolean;
 *   currentUserId: string | null;
 *   canModerateProducts: boolean;
 *   mainView: string;
 *   onCatalogError: (message: string) => void;
 *   setRaffleModal: import('react').Dispatch<import('react').SetStateAction<
 *     | { mode: 'create' }
 *     | { mode: 'edit'; raffle: import('../../../entities/raffle/model/types.js').RaffleFromApi; useStaffApi: boolean }
 *     | null
 *   >>;
 *   refreshPendingRafflesCount: () => void | Promise<void>;
 * }} params
 */
export function useHomeFeaturedContent({
  isHomeCatalogMainView,
  isAuthorized,
  currentUserId,
  canModerateProducts,
  mainView,
  onCatalogError,
  setRaffleModal,
  refreshPendingRafflesCount,
}) {
  const queryClient = useQueryClient();
  const { deleteMyMutation, deleteStaffMutation, pauseMyMutation } = useRaffleMutations();
  const [featuredRaffleIndex, setFeaturedRaffleIndex] = useState(0);
  const [isFeaturedRaffleBusy, setIsFeaturedRaffleBusy] = useState(false);

  const featuredQuery = useFeaturedRafflesQuery({ enabled: isHomeCatalogMainView });
  const { userStoriesFeed } = useUserStoriesFeedQuery({ enabled: isHomeCatalogMainView });

  const shouldTrackSellerRaffle =
    isAuthorized && (mainView === "my-products" || mainView === "my-profile");
  const myRaffleQuery = useMyRaffleQuery({ enabled: shouldTrackSellerRaffle });

  const featuredRaffles = useMemo(
    () => (isHomeCatalogMainView ? (featuredQuery.data ?? []) : []),
    [featuredQuery.data, isHomeCatalogMainView],
  );

  useEffect(() => {
    setFeaturedRaffleIndex(0);
  }, [featuredRaffles.length, featuredQuery.dataUpdatedAt]);

  const sellerRaffleActive = myRaffleQuery.data?.raffle?.status === "active";

  const refreshFeaturedRaffle = useCallback(async () => {
    await invalidateFeaturedRaffles(queryClient);
  }, [queryClient]);

  const handleUserStoriesRefresh = useCallback(() => {
    void invalidateUserStoriesFeed(queryClient);
  }, [queryClient]);

  const refreshRaffleSurfaces = useCallback(async () => {
    await invalidateAllRaffleQueries(queryClient);
  }, [queryClient]);

  const handleFeaturedRaffleEdit = useCallback(
    (raffle) => {
      if (!raffle) {
        return;
      }
      const isOwner =
        currentUserId != null && String(raffle.sellerId) === String(currentUserId);
      setRaffleModal({
        mode: "edit",
        raffle,
        useStaffApi: canModerateProducts && !isOwner,
      });
    },
    [canModerateProducts, currentUserId, setRaffleModal],
  );

  const handleFeaturedRaffleDelete = useCallback(
    async (raffle) => {
      if (!raffle?._id) {
        return;
      }
      const isOwner =
        currentUserId != null && String(raffle.sellerId) === String(currentUserId);
      const confirmMessage = isOwner
        ? RAFFLE_MANAGE_UI.DELETE_CONFIRM_OWNER
        : RAFFLE_MANAGE_UI.DELETE_CONFIRM_STAFF;
      if (!window.confirm(confirmMessage)) {
        return;
      }
      try {
        setIsFeaturedRaffleBusy(true);
        if (isOwner) {
          await deleteMyMutation.mutateAsync(raffle._id);
        } else {
          await deleteStaffMutation.mutateAsync(raffle._id);
        }
        await refreshRaffleSurfaces();
        void refreshPendingRafflesCount();
      } catch (e) {
        onCatalogError(
          e instanceof Error ? e.message : API_CLIENT_UI.DELETE_RAFFLE_FALLBACK,
        );
      } finally {
        setIsFeaturedRaffleBusy(false);
      }
    },
    [
      currentUserId,
      deleteMyMutation,
      deleteStaffMutation,
      onCatalogError,
      refreshPendingRafflesCount,
      refreshRaffleSurfaces,
    ],
  );

  const handleFeaturedRafflePause = useCallback(
    async (raffle) => {
      if (!raffle?._id) {
        return;
      }
      const isOwner =
        currentUserId != null && String(raffle.sellerId) === String(currentUserId);
      if (!isOwner) {
        return;
      }
      try {
        setIsFeaturedRaffleBusy(true);
        await pauseMyMutation.mutateAsync(raffle._id);
        await refreshRaffleSurfaces();
      } catch (e) {
        onCatalogError(
          e instanceof Error ? e.message : API_CLIENT_UI.PAUSE_RAFFLE_FALLBACK,
        );
      } finally {
        setIsFeaturedRaffleBusy(false);
      }
    },
    [currentUserId, onCatalogError, pauseMyMutation, refreshRaffleSurfaces],
  );

  const getFeaturedRaffleManage = useCallback(
    (raffle) => {
      if (!raffle) {
        return null;
      }
      const isOwner =
        currentUserId != null && String(raffle.sellerId) === String(currentUserId);
      const canManage = isOwner || canModerateProducts;
      if (!canManage) {
        return null;
      }
      return {
        showEdit: isOwner ? canSellerEditRaffle(raffle) : canModerateProducts,
        showDelete: true,
        showPause: isOwner && raffle.status === "active",
        onEdit: () => handleFeaturedRaffleEdit(raffle),
        onDelete: () => void handleFeaturedRaffleDelete(raffle),
        onPause: () => void handleFeaturedRafflePause(raffle),
        busy: isFeaturedRaffleBusy,
      };
    },
    [
      canModerateProducts,
      currentUserId,
      handleFeaturedRaffleDelete,
      handleFeaturedRaffleEdit,
      handleFeaturedRafflePause,
      isFeaturedRaffleBusy,
    ],
  );

  return {
    featuredRaffles,
    featuredRaffleIndex,
    setFeaturedRaffleIndex,
    userStoriesFeed,
    handleUserStoriesRefresh,
    sellerRaffleActive,
    getFeaturedRaffleManage,
    refreshFeaturedRaffle,
    refreshRaffleSurfaces,
  };
}
