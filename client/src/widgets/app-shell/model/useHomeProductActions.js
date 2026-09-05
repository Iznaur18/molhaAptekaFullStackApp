import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  buildAffiliateManageToggleBody,
  resolveAffiliateEnableLoyaltyGate,
  resolveAffiliateToggleSourceProduct,
} from "@izibuy/shared-lib";

import { setProductInstallmentEnabled } from "../../../entities/installment/lib/setProductInstallmentEnabled.js";
import { useEnsureProductPromotionTariffs } from "../../../entities/product/model/useEnsureProductPromotionTariffs.js";
import { useMyProductMutations } from "../../../entities/product/model/useMyProductMutations.js";
import { useRequestProductPromotionMutation } from "../../../entities/product/model/useRequestProductPromotionMutation.js";
import {
  invalidateCatalogProducts,
  patchProductInAllCatalogCaches,
  prependProductToAllCatalogCaches,
} from "../../../entities/product/lib/catalogProductsQueryCache.js";
import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";
import { catalogQueryKeys } from "../../../entities/product/model/catalogQueryKeys.js";
import { useRaffleMutations } from "../../../entities/raffle/model/useRaffleMutations.js";
import { PRODUCT_MODERATION_PENDING } from "../../../entities/product/model/productModerationConstants.js";
import { createPlatformServicePayment } from "../../../entities/payment/api/paymentApi.js";
import { createClientIdempotencyKey } from "../../../shared/lib/createClientIdempotencyKey.js";
import { HOME_MAIN_VIEW_PATH } from "../../../shared/lib/homeMainViewPaths.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {object} params
 */
export const useHomeProductActions = ({
  goToMainView,
  navigate,
  setMyProductsCatalogNotice,
  isAtSellerProductsLimit,
  setIsSellerProductsLimitModalOpen,
  setIsCreateProductModalOpen,
  setProductToEdit,
  setProductToCopy,
  setProductDetailsAdminError,
  isMineMode,
  selectedProductCategory,
  setDeletingProductId,
  setTogglingAvailabilityProductId,
  setTogglingAuctionProductId,
  setTogglingQaProductId,
  setTogglingOriginalityProductId,
  setTogglingOutOfStockProductId,
  setTogglingWholesaleProductId,
  setTogglingFlashSaleProductId,
  setTogglingRentalProductId,
  setTogglingAffiliateProductId,
  setTogglingLoyaltyProductId,
  setTogglingBuyNFreeProductId,
  setTogglingInstallmentProductId,
  setMyProductsCatalogError,
  setPromotionProduct,
  setPromotionConfig,
  setPromotionModalError,
  setIsPromotionSubmitPending,
  promotionProduct,
  productToEdit,
  loyaltyPoints,
  loyaltyPointsReserved,
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
      setMyProductsCatalogNotice(
        product.productModerationStatus === PRODUCT_MODERATION_PENDING
          ? API_CLIENT_UI.CREATE_PRODUCT_PENDING_HINT
          : "",
      );
      prependProductToAllCatalogCaches(queryClient, product);
      const productId = product?._id != null ? String(product._id) : "";
      if (productId) {
        queryClient.setQueryData(catalogQueryKeys.byId(productId), product);
        navigateToProductDetails(navigate, product);
      } else {
        goToMainView("my-products");
      }
      void refreshCatalogFeed();
    },
    [
      goToMainView,
      navigate,
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
    setProductToCopy(null);
    setIsCreateProductModalOpen(true);
  }, [
    isAtSellerProductsLimit,
    setIsCreateProductModalOpen,
    setIsSellerProductsLimitModalOpen,
    setProductToCopy,
    setProductToEdit,
  ]);

  const handleCopyMyProduct = useCallback(
    (product) => {
      if (!product) {
        return;
      }
      if (isAtSellerProductsLimit) {
        setIsSellerProductsLimitModalOpen(true);
        return;
      }
      setProductToEdit(null);
      setProductToCopy(product);
      setIsCreateProductModalOpen(true);
    },
    [
      isAtSellerProductsLimit,
      setIsCreateProductModalOpen,
      setIsSellerProductsLimitModalOpen,
      setProductToCopy,
      setProductToEdit,
    ],
  );

  const handleOpenEditMyProduct = useCallback(
    (product) => {
      setIsCreateProductModalOpen(false);
      setProductToCopy(null);
      setProductToEdit(product);
    },
    [setIsCreateProductModalOpen, setProductToCopy, setProductToEdit],
  );

  const handleCloseEditProductModal = useCallback(() => {
    setIsCreateProductModalOpen(false);
    setProductToCopy(null);
    setProductToEdit(null);
  }, [setIsCreateProductModalOpen, setProductToCopy, setProductToEdit]);

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

  const handleSetProductQa = useCallback(
    async (productId, qaEnabled) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      setTogglingQaProductId(normalizedProductId);
      setProductDetailsAdminError("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productQaEnabled: qaEnabled },
        });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setProductDetailsAdminError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingQaProductId(null);
      }
    },
    [
      patchMutation,
      setProductDetailsAdminError,
      setTogglingQaProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleSetProductOriginality = useCallback(
    async (productId, isOriginal) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      setTogglingOriginalityProductId(normalizedProductId);
      setMyProductsCatalogError("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productIsOriginal: isOriginal },
        });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setMyProductsCatalogError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingOriginalityProductId(null);
      }
    },
    [
      patchMutation,
      setMyProductsCatalogError,
      setTogglingOriginalityProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleSetProductOutOfStock = useCallback(
    async (productId, outOfStock) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      setTogglingOutOfStockProductId(normalizedProductId);
      setMyProductsCatalogError("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productOutOfStock: outOfStock },
        });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setMyProductsCatalogError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingOutOfStockProductId(null);
      }
    },
    [
      patchMutation,
      setMyProductsCatalogError,
      setTogglingOutOfStockProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleSetProductWholesale = useCallback(
    async (productId, wholesaleEnabled) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      setTogglingWholesaleProductId(normalizedProductId);
      setProductDetailsAdminError("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productWholesaleEnabled: wholesaleEnabled },
        });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setProductDetailsAdminError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingWholesaleProductId(null);
      }
    },
    [
      patchMutation,
      setProductDetailsAdminError,
      setTogglingWholesaleProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleSetProductBuyNFree = useCallback(
    async (productId, buyNFreeEnabled) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      setTogglingBuyNFreeProductId(normalizedProductId);
      setProductDetailsAdminError("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productBuyNFreeEnabled: buyNFreeEnabled },
        });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setProductDetailsAdminError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingBuyNFreeProductId(null);
      }
    },
    [
      patchMutation,
      setProductDetailsAdminError,
      setTogglingBuyNFreeProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleSetProductFlashSale = useCallback(
    async (productId, flashSaleEnabled) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      setTogglingFlashSaleProductId(normalizedProductId);
      setProductDetailsAdminError("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productFlashSaleEnabled: flashSaleEnabled },
        });
        syncCatalogProductState({
          ...updated,
          productFlashSaleEnabled: flashSaleEnabled,
          ...(flashSaleEnabled
            ? {}
            : {
                productFlashSaleEndsAt: null,
                productFlashSaleBasePrice: null,
                productFlashSaleDurationMinutes: null,
                productOldPrice: null,
              }),
        });
        syncProductEditModalState({
          ...updated,
          productFlashSaleEnabled: flashSaleEnabled,
          ...(flashSaleEnabled
            ? {}
            : {
                productFlashSaleEndsAt: null,
                productFlashSaleBasePrice: null,
                productFlashSaleDurationMinutes: null,
                productOldPrice: null,
              }),
        });
      } catch (e) {
        setProductDetailsAdminError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingFlashSaleProductId(null);
      }
    },
    [
      patchMutation,
      setProductDetailsAdminError,
      setTogglingFlashSaleProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleSetProductRental = useCallback(
    async (productId, rentalEnabled) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      setTogglingRentalProductId(normalizedProductId);
      setProductDetailsAdminError("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productRentalEnabled: rentalEnabled },
        });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setProductDetailsAdminError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingRentalProductId(null);
      }
    },
    [
      patchMutation,
      setProductDetailsAdminError,
      setTogglingRentalProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleSetProductAffiliate = useCallback(
    async (productId, affiliateEnabled, productHint) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      setTogglingAffiliateProductId(normalizedProductId);
      setProductDetailsAdminError("");
      try {
        const sourceProduct = resolveAffiliateToggleSourceProduct(
          normalizedProductId,
          [productHint, promotionProduct, productToEdit],
        );
        if (affiliateEnabled && sourceProduct?.affiliateEnabled !== true) {
          const percent = Math.floor(Number(sourceProduct?.affiliatePercent) || 0);
          const price = Math.floor(Number(sourceProduct?.productPrice) || 0);
          const gate = resolveAffiliateEnableLoyaltyGate({
            productPrice: price,
            affiliatePercent: percent,
            loyaltyPointsBalance: loyaltyPoints,
            loyaltyPointsReserved,
          });
          if (!gate.ok) {
            setProductDetailsAdminError(gate.message);
            return;
          }
        }
        const body = buildAffiliateManageToggleBody(sourceProduct, affiliateEnabled);
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body,
        });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setProductDetailsAdminError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingAffiliateProductId(null);
      }
    },
    [
      loyaltyPoints,
      loyaltyPointsReserved,
      patchMutation,
      productToEdit,
      promotionProduct,
      setProductDetailsAdminError,
      setTogglingAffiliateProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleSetProductLoyaltyPoints = useCallback(
    async (productId, loyaltyPointsPerUnit) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      const nextPoints = Math.max(0, Math.floor(Number(loyaltyPointsPerUnit)) || 0);
      setTogglingLoyaltyProductId(normalizedProductId);
      setProductDetailsAdminError("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { loyaltyPointsPerUnit: nextPoints },
        });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setProductDetailsAdminError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingLoyaltyProductId(null);
      }
    },
    [
      patchMutation,
      setProductDetailsAdminError,
      setTogglingLoyaltyProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleWholesaleSaved = useCallback(
    (product) => {
      syncCatalogProductState(product);
      syncProductEditModalState(product);
    },
    [syncCatalogProductState, syncProductEditModalState],
  );

  const handleSetProductInstallment = useCallback(
    async (productId, installmentEnabled) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return undefined;
      }
      setTogglingInstallmentProductId(normalizedProductId);
      setProductDetailsAdminError("");
      try {
        const result = await setProductInstallmentEnabled(
          normalizedProductId,
          installmentEnabled,
        );
        if (result.needsSetup) {
          return { needsSetup: true };
        }
        const nextEnabled = result.productInstallmentEnabled === true;
        updateCatalogProduct(normalizedProductId, (prev) =>
          prev ? { ...prev, productInstallmentEnabled: nextEnabled } : prev,
        );
        const mergeFlag = (prev) =>
          prev && String(prev._id) === normalizedProductId
            ? { ...prev, productInstallmentEnabled: nextEnabled }
            : prev;
        setProductToEdit(mergeFlag);
        setPromotionProduct(mergeFlag);
        return { productInstallmentEnabled: nextEnabled };
      } catch (e) {
        setProductDetailsAdminError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
        return undefined;
      } finally {
        setTogglingInstallmentProductId(null);
      }
    },
    [
      setProductDetailsAdminError,
      setProductToEdit,
      setPromotionProduct,
      setTogglingInstallmentProductId,
      updateCatalogProduct,
    ],
  );

  const handleInstallmentProgramSaved = useCallback(
    (productPatch) => {
      const productId = String(promotionProduct?._id ?? "").trim();
      if (!productId || !productPatch || typeof productPatch !== "object") {
        return;
      }
      const nextEnabled = productPatch.productInstallmentEnabled === true;
      updateCatalogProduct(productId, (prev) =>
        prev ? { ...prev, productInstallmentEnabled: nextEnabled } : prev,
      );
      const mergeFlag = (prev) =>
        prev && String(prev._id) === productId
          ? { ...prev, productInstallmentEnabled: nextEnabled }
          : prev;
      setProductToEdit(mergeFlag);
      setPromotionProduct(mergeFlag);
    },
    [
      promotionProduct?._id,
      setProductToEdit,
      setPromotionProduct,
      updateCatalogProduct,
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
        const { promotion } = await requestPromotionMutation.mutateAsync({
          productId: String(promotionProduct._id),
          tier,
          tariffCode,
        });

        // Заявка больше не включает продвижение — она выставляет счёт.
        // Ведём человека на оплату сразу: искать неоплаченную заявку в
        // списке он не должен.
        const payment = await createPlatformServicePayment({
          serviceKind: "product_promotion",
          targetId: String(promotion._id),
          returnUrl: HOME_MAIN_VIEW_PATH["my-products"],
          idempotencyKey: createClientIdempotencyKey(),
        });

        if (!payment?.confirmationUrl) {
          throw new Error(API_CLIENT_UI.REQUEST_PRODUCT_PROMOTION_FALLBACK);
        }
        handleClosePromotionModal();
        window.location.assign(payment.confirmationUrl);
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
      requestPromotionMutation,
      setIsPromotionSubmitPending,
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
    handleCopyMyProduct,
    handleOpenEditMyProduct,
    handleCloseEditProductModal,
    handleEditProductSuccess,
    handleAdminOpenEditProductFromDetails,
    handleSetMyProductAvailability,
    handleSetProductAuction,
    handleSetProductQa,
    handleSetProductOriginality,
    handleSetProductOutOfStock,
    handleSetProductWholesale,
    handleSetProductBuyNFree,
    handleSetProductFlashSale,
    handleSetProductRental,
    handleSetProductAffiliate,
    handleSetProductLoyaltyPoints,
    handleWholesaleSaved,
    handleSetProductInstallment,
    handleInstallmentProgramSaved,
    handleDeleteMyProduct,
    handleOpenPromotionModal,
    handleClosePromotionModal,
    handleSubmitPromotionRequest,
    handleToggleRaffleParticipation,
  };
};
