import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useEnsureProductPromotionTariffs } from "../../../entities/product/model/useEnsureProductPromotionTariffs.js";
import { useMyProductMutations } from "../../../entities/product/model/useMyProductMutations.js";
import { useRequestProductPromotionMutation } from "../../../entities/product/model/useRequestProductPromotionMutation.js";
import {
  invalidateCatalogProducts,
  patchProductInAllCatalogCaches,
  prependProductToAllCatalogCaches,
} from "../../../entities/product/lib/catalogProductsQueryCache.js";
import { useRaffleMutations } from "../../../entities/raffle/model/useRaffleMutations.js";
import { PRODUCT_MODERATION_PENDING } from "../../../entities/product/model/productModerationConstants.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {object} params
 */
export const useHomeProductActions = ({
  goToMainView,
  setMyProductsCatalogNotice,
  isAtSellerProductsLimit,
  setIsSellerProductsLimitModalOpen,
  setIsCreateProductModalOpen,
  setProductToEdit,
  setProductDetailsAdminError,
  isMineMode,
  selectedProductCategory,
  setDeletingProductId,
  setTogglingAvailabilityProductId,
  setTogglingAuctionProductId,
  setMyProductsCatalogError,
  setPromotionProduct,
  setPromotionConfig,
  setPromotionModalError,
  setIsPromotionSubmitPending,
  promotionProduct,
  setLoyaltyPoints,
  refreshCatalogFeed,
  refreshRaffleSurfaces,
  setRaffleParticipationPendingProductId,
}) => {
  const queryClient = useQueryClient();
  const ensureProductPromotionTariffs = useEnsureProductPromotionTariffs();
  const { patchMutation, deleteMutation } = useMyProductMutations();
  const requestPromotionMutation = useRequestProductPromotionMutation();
  const { setParticipationMutation } = useRaffleMutations();

  const removeCatalogProduct = useCallback(
    (productId) => {
      patchProductInAllCatalogCaches(queryClient, productId, () => null);
    },
    [queryClient],
  );

  const updateCatalogProduct = useCallback(
    /**
     * @param {string} productId
     * @param {(product: ProductFromApi) => ProductFromApi} updater
     */
    (productId, updater) => {
      patchProductInAllCatalogCaches(queryClient, productId, updater);
    },
    [queryClient],
  );

  const syncProductEditModalState = useCallback(
    (product) => {
      const id = String(product._id);
      const mergeProduct = (prev) =>
        prev && String(prev._id) === id
          ? { ...product, hasOpenSales: prev.hasOpenSales ?? product.hasOpenSales }
          : prev;

      setProductToEdit(mergeProduct);
      setPromotionProduct(mergeProduct);
    },
    [setProductToEdit, setPromotionProduct],
  );

  const syncCatalogProductState = useCallback(
    (product) => {
      const id = String(product._id);

      if (product.productIsAvailable === false && !isMineMode) {
        removeCatalogProduct(id);
        return;
      }

      if (
        selectedProductCategory &&
        product.productCategory !== selectedProductCategory
      ) {
        removeCatalogProduct(id);
        return;
      }

      updateCatalogProduct(id, (prev) => ({
        ...product,
        hasOpenSales: prev.hasOpenSales ?? product.hasOpenSales,
      }));
    },
    [
      isMineMode,
      removeCatalogProduct,
      selectedProductCategory,
      updateCatalogProduct,
    ],
  );

  const handleCreateProductSuccess = useCallback(
    (product) => {
      goToMainView("my-products");
      setMyProductsCatalogNotice(
        product.productModerationStatus === PRODUCT_MODERATION_PENDING
          ? API_CLIENT_UI.CREATE_PRODUCT_PENDING_HINT
          : "",
      );
      prependProductToAllCatalogCaches(queryClient, product);
      void refreshCatalogFeed();
    },
    [
      goToMainView,
      queryClient,
      refreshCatalogFeed,
      setMyProductsCatalogNotice,
    ],
  );

  const handlePlaceProductClick = useCallback(() => {
    if (isAtSellerProductsLimit) {
      setIsSellerProductsLimitModalOpen(true);
      return;
    }
    setProductToEdit(null);
    setIsCreateProductModalOpen(true);
  }, [
    isAtSellerProductsLimit,
    setIsCreateProductModalOpen,
    setIsSellerProductsLimitModalOpen,
    setProductToEdit,
  ]);

  const handleOpenEditMyProduct = useCallback(
    (product) => {
      setIsCreateProductModalOpen(false);
      setProductToEdit(product);
    },
    [setIsCreateProductModalOpen, setProductToEdit],
  );

  const handleCloseEditProductModal = useCallback(() => {
    setIsCreateProductModalOpen(false);
    setProductToEdit(null);
  }, [setIsCreateProductModalOpen, setProductToEdit]);

  const handleEditProductSuccess = useCallback(
    (product) => {
      syncCatalogProductState(product);
      syncProductEditModalState(product);
      void invalidateCatalogProducts(queryClient);
    },
    [queryClient, syncCatalogProductState, syncProductEditModalState],
  );

  const handleAdminOpenEditProductFromDetails = useCallback(() => {
    /* edit открывается со страницы /product/:id через setProductToEdit */
  }, []);

  const handleSetMyProductAvailability = useCallback(
    async (productId, isAvailable) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      setTogglingAvailabilityProductId(normalizedProductId);
      setMyProductsCatalogError("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productIsAvailable: isAvailable },
        });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setMyProductsCatalogError(
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingAvailabilityProductId(null);
      }
    },
    [
      patchMutation,
      setMyProductsCatalogError,
      setTogglingAvailabilityProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleSetProductAuction = useCallback(
    async (productId, auctionEnabled) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      setTogglingAuctionProductId(normalizedProductId);
      setProductDetailsAdminError("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productAuctionEnabled: auctionEnabled },
        });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setProductDetailsAdminError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingAuctionProductId(null);
      }
    },
    [
      patchMutation,
      setProductDetailsAdminError,
      setTogglingAuctionProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleDeleteMyProduct = useCallback(
    async (productId) => {
      try {
        setDeletingProductId(productId);
        setMyProductsCatalogError("");
        setProductDetailsAdminError("");
        await deleteMutation.mutateAsync(productId);
        removeCatalogProduct(productId);
        setProductToEdit((prev) =>
          prev && String(prev._id) === productId ? null : prev,
        );
        setPromotionProduct((prev) =>
          prev && String(prev._id) === productId ? null : prev,
        );
        void refreshCatalogFeed();
        return true;
      } catch (e) {
        const message =
          e instanceof Error ? e.message : API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK;
        setMyProductsCatalogError(message);
        setProductDetailsAdminError(message);
        return false;
      } finally {
        setDeletingProductId(null);
      }
    },
    [
      deleteMutation,
      refreshCatalogFeed,
      removeCatalogProduct,
      setDeletingProductId,
      setMyProductsCatalogError,
      setProductDetailsAdminError,
      setProductToEdit,
      setPromotionProduct,
    ],
  );

  const handleOpenPromotionModal = useCallback(
    async (product) => {
      setPromotionProduct(product);
      setPromotionModalError("");
      try {
        const config = await ensureProductPromotionTariffs();
        setPromotionConfig(config);
      } catch (e) {
        setPromotionModalError(
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.FETCH_PRODUCT_PROMOTION_TARIFFS_FALLBACK,
        );
        setPromotionConfig({ tiers: [], durations: [] });
      }
    },
    [ensureProductPromotionTariffs, setPromotionModalError, setPromotionProduct, setPromotionConfig],
  );

  const handleClosePromotionModal = useCallback(() => {
    setPromotionProduct(null);
    setPromotionConfig({ tiers: [], durations: [] });
    setPromotionModalError("");
  }, [setPromotionModalError, setPromotionProduct, setPromotionConfig]);

  const handleSubmitPromotionRequest = useCallback(
    async (tier, tariffCode) => {
      if (!promotionProduct?._id) {
        return;
      }
      setIsPromotionSubmitPending(true);
      setPromotionModalError("");
      try {
        const { loyaltyPointsBalance, message } = await requestPromotionMutation.mutateAsync({
          productId: String(promotionProduct._id),
          tier,
          tariffCode,
        });
        if (loyaltyPointsBalance != null) {
          setLoyaltyPoints(loyaltyPointsBalance);
        }
        setMyProductsCatalogNotice(message ?? "Продвижение активировано.");
        void refreshCatalogFeed();
        handleClosePromotionModal();
      } catch (e) {
        setPromotionModalError(
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.REQUEST_PRODUCT_PROMOTION_FALLBACK,
        );
      } finally {
        setIsPromotionSubmitPending(false);
      }
    },
    [
      handleClosePromotionModal,
      promotionProduct,
      refreshCatalogFeed,
      requestPromotionMutation,
      setIsPromotionSubmitPending,
      setLoyaltyPoints,
      setMyProductsCatalogNotice,
      setPromotionModalError,
    ],
  );

  const handleToggleRaffleParticipation = useCallback(
    async (product, enabled) => {
      if (product._id == null) {
        return;
      }
      const productId = String(product._id);
      setRaffleParticipationPendingProductId(productId);
      try {
        const updated = await setParticipationMutation.mutateAsync({
          productId,
          enabled,
        });
        updateCatalogProduct(productId, () => updated);
        syncProductEditModalState(updated);
        void refreshRaffleSurfaces();
      } catch (e) {
        setMyProductsCatalogError(
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.SET_RAFFLE_PARTICIPATION_FALLBACK,
        );
      } finally {
        setRaffleParticipationPendingProductId(null);
      }
    },
    [
      refreshRaffleSurfaces,
      setMyProductsCatalogError,
      setParticipationMutation,
      setRaffleParticipationPendingProductId,
      syncProductEditModalState,
      updateCatalogProduct,
    ],
  );

  return {
    handleCreateProductSuccess,
    handlePlaceProductClick,
    handleOpenEditMyProduct,
    handleCloseEditProductModal,
    handleEditProductSuccess,
    handleAdminOpenEditProductFromDetails,
    handleSetMyProductAvailability,
    handleSetProductAuction,
    handleDeleteMyProduct,
    handleOpenPromotionModal,
    handleClosePromotionModal,
    handleSubmitPromotionRequest,
    handleToggleRaffleParticipation,
  };
};
