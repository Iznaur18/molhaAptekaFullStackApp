import { useCallback, useEffect, useState } from "react";

import { deleteMyRaffle } from "../../../entities/raffle/api/deleteMyRaffle.js";
import { deleteRaffleByStaff } from "../../../entities/raffle/api/deleteRaffleByStaff.js";
import { fetchFeaturedRaffles } from "../../../entities/raffle/api/fetchFeaturedRaffle.js";
import { fetchMyRaffle } from "../../../entities/raffle/api/fetchMyRaffle.js";
import { pauseMyRaffle } from "../../../entities/raffle/api/pauseMyRaffle.js";
import { canSellerEditRaffle } from "../../../entities/raffle/lib/canSellerEditRaffle.js";
import { fetchUserStoriesFeed } from "../../../entities/user-story/api/fetchUserStoriesFeed.js";
import { fetchMyProductPromotions } from "../../../entities/product/api/fetchMyProductPromotions.js";
import { API_CLIENT_UI, RAFFLE_MANAGE_UI } from "../../../shared/config/appUiCopy.js";
/**
 * @param {{
 *   isHomeCatalogMainView: boolean;
 *   isAuthorized: boolean;
 *   currentUserId: string | null;
 *   canModerateProducts: boolean;
 *   catalogRefreshTick: number;
 *   raffleRefreshTick: number;
 *   mainView: string;
 *   activeProfileTab: string;
 *   onCatalogError: (message: string) => void;
 *   setRaffleModal: import('react').Dispatch<import('react').SetStateAction<
 *     | { mode: 'create' }
 *     | { mode: 'edit'; raffle: import('../../../entities/raffle/model/types.js').RaffleFromApi; useStaffApi: boolean }
 *     | null
 *   >>;
 *   setRaffleRefreshTick: import('react').Dispatch<import('react').SetStateAction<number>>;
 *   refreshPendingRafflesCount: () => void | Promise<void>;
 * }} params
 */
export function useHomeFeaturedContent({
  isHomeCatalogMainView,
  isAuthorized,
  currentUserId,
  canModerateProducts,
  catalogRefreshTick,
  raffleRefreshTick,
  mainView,
  activeProfileTab,
  onCatalogError,
  setRaffleModal,
  setRaffleRefreshTick,
  refreshPendingRafflesCount,
}) {
  const [featuredRaffles, setFeaturedRaffles] = useState(
    /** @type {import('../../../entities/raffle/model/types.js').RaffleFromApi[]} */ ([]),
  );
  const [featuredRaffleIndex, setFeaturedRaffleIndex] = useState(0);
  const [userStoriesFeed, setUserStoriesFeed] = useState(
    /** @type {import('../../../entities/user-story/model/types.js').UserStoriesFeedFromApi} */ ({
      rings: [],
      canPublish: false,
      showStrip: false,
    }),
  );
  const [userStoriesRefreshTick, setUserStoriesRefreshTick] = useState(0);
  const [sellerRaffleActive, setSellerRaffleActive] = useState(false);
  const [isFeaturedRaffleBusy, setIsFeaturedRaffleBusy] = useState(false);
  const [pendingPromotionProductIds, setPendingPromotionProductIds] = useState(
    /** @type {Set<string>} */ (() => new Set()),
  );

  const refreshFeaturedRaffle = useCallback(async () => {
    if (!isHomeCatalogMainView) {
      setFeaturedRaffles([]);
      setFeaturedRaffleIndex(0);
      return;
    }
    try {
      const raffles = await fetchFeaturedRaffles();
      setFeaturedRaffles(raffles);
      setFeaturedRaffleIndex(0);
    } catch {
      setFeaturedRaffles([]);
      setFeaturedRaffleIndex(0);
    }
  }, [isHomeCatalogMainView]);

  useEffect(() => {
    void refreshFeaturedRaffle();
  }, [refreshFeaturedRaffle, catalogRefreshTick, raffleRefreshTick]);

  const refreshUserStoriesFeed = useCallback(async () => {
    if (!isHomeCatalogMainView) {
      setUserStoriesFeed({
        rings: [],
        canPublish: false,
        showStrip: false,
      });
      return;
    }
    try {
      const feed = await fetchUserStoriesFeed();
      setUserStoriesFeed(feed);
    } catch {
      setUserStoriesFeed({
        rings: [],
        canPublish: false,
        showStrip: false,
      });
    }
  }, [isHomeCatalogMainView]);

  useEffect(() => {
    void refreshUserStoriesFeed();
  }, [
    refreshUserStoriesFeed,
    userStoriesRefreshTick,
    catalogRefreshTick,
    isAuthorized,
  ]);

  const handleUserStoriesRefresh = useCallback(() => {
    setUserStoriesRefreshTick((value) => value + 1);
  }, []);

  const refreshSellerRaffleState = useCallback(async () => {
    if (!isAuthorized) {
      setSellerRaffleActive(false);
      return;
    }
    try {
      const { raffle } = await fetchMyRaffle();
      setSellerRaffleActive(raffle?.status === "active");
    } catch {
      setSellerRaffleActive(false);
    }
  }, [isAuthorized]);

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
          await deleteMyRaffle(raffle._id);
        } else {
          await deleteRaffleByStaff(raffle._id);
        }
        setRaffleRefreshTick((n) => n + 1);
        void refreshFeaturedRaffle();
        void refreshSellerRaffleState();
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
      onCatalogError,
      refreshFeaturedRaffle,
      refreshPendingRafflesCount,
      refreshSellerRaffleState,
      setRaffleRefreshTick,
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
        await pauseMyRaffle(raffle._id);
        setRaffleRefreshTick((n) => n + 1);
        void refreshFeaturedRaffle();
        void refreshSellerRaffleState();
      } catch (e) {
        onCatalogError(
          e instanceof Error ? e.message : API_CLIENT_UI.PAUSE_RAFFLE_FALLBACK,
        );
      } finally {
        setIsFeaturedRaffleBusy(false);
      }
    },
    [
      currentUserId,
      onCatalogError,
      refreshFeaturedRaffle,
      refreshSellerRaffleState,
      setRaffleRefreshTick,
    ],
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

  useEffect(() => {
    if (mainView === "my-products" || mainView === "my-profile") {
      void refreshSellerRaffleState();
    }
  }, [mainView, refreshSellerRaffleState, raffleRefreshTick, isAuthorized]);

  const refreshMyPromotionPendingIds = useCallback(async () => {
    if (!isAuthorized) {
      setPendingPromotionProductIds(new Set());
      return;
    }
    try {
      const { promotions } = await fetchMyProductPromotions({
        status: "pending_staff",
        limit: 200,
      });
      setPendingPromotionProductIds(
        new Set(promotions.map((row) => String(row.productId))),
      );
    } catch {
      setPendingPromotionProductIds(new Set());
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (mainView === "my-products") {
      void refreshMyPromotionPendingIds();
    }
  }, [mainView, refreshMyPromotionPendingIds, catalogRefreshTick]);

  return {
    featuredRaffles,
    featuredRaffleIndex,
    setFeaturedRaffleIndex,
    userStoriesFeed,
    handleUserStoriesRefresh,
    sellerRaffleActive,
    getFeaturedRaffleManage,
    pendingPromotionProductIds,
    refreshFeaturedRaffle,
    refreshSellerRaffleState,
    refreshMyPromotionPendingIds,
  };
}
