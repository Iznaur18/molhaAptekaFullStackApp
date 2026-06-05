import { useCallback } from "react";

import { deleteMyProduct } from "../../../entities/product/api/deleteMyProduct.js";
import { patchMyProduct } from "../../../entities/product/api/patchMyProduct.js";
import { fetchProductPromotionTariffs } from "../../../entities/product/api/fetchProductPromotionTariffs.js";
import { requestProductPromotion } from "../../../entities/product/api/requestProductPromotion.js";
import { setProductRaffleParticipation } from "../../../entities/raffle/api/setProductRaffleParticipation.js";
import { PRODUCT_MODERATION_PENDING } from "../../../entities/product/model/productModerationConstants.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {object} params
 */
export const useHomeProductActions = ({
  goToMainView,
  setMyProductsCatalogNotice,
  setMyProductsTotal,
  setProducts,
  isAtSellerProductsLimit,
  setIsSellerProductsLimitModalOpen,
  setIsCreateProductModalOpen,
  setProductToEdit,
  setCatalogProductDetails,
  setProductDetailsAdminError,
  catalogProductDetails,
  isMineMode,
  showHiddenCatalogProducts,
  selectedProductCategory,
  setDeletingProductId,
  setTogglingAvailabilityProductId,
  setTogglingAuctionProductId,
  setMyProductsCatalogError,
  setPromotionProduct,
  setPromotionTariffs,
  setPromotionModalError,
  setIsPromotionSubmitPending,
  promotionProduct,
  setLoyaltyPoints,
  refreshMyPromotionPendingIds,
  setCatalogRefreshTick,
  setRaffleRefreshTick,
  refreshFeaturedRaffle,
  setRaffleParticipationPendingProductId,
}) => {
  const syncProductEditModalState = useCallback(
    (product) => {
      const id = String(product._id);
      setProductToEdit((prev) =>
        prev && String(prev._id) === id
          ? { ...product, hasOpenSales: prev.hasOpenSales ?? product.hasOpenSales }
          : prev,
      );
    },
    [setProductToEdit],
  );

  const syncCatalogProductState = useCallback(
    (product) => {
      const id = String(product._id);
      setCatalogProductDetails((prev) =>
        prev && String(prev._id) === id
          ? {
              ...product,
              hasOpenSales: prev.hasOpenSales ?? product.hasOpenSales,
            }
          : prev,
      );
      setProducts((prev) => {
        if (
          product.productIsAvailable === false &&
          !isMineMode &&
          !showHiddenCatalogProducts
        ) {
          return prev.filter((p) => String(p._id) !== id);
        }
        if (
          selectedProductCategory &&
          product.productCategory !== selectedProductCategory
        ) {
          return prev.filter((p) => String(p._id) !== id);
        }
        if (!prev.some((p) => String(p._id) === id)) {
          return prev;
        }
        return prev.map((p) =>
          String(p._id) === id
            ? { ...product, hasOpenSales: p.hasOpenSales ?? product.hasOpenSales }
            : p,
        );
      });
    },
    [
      isMineMode,
      selectedProductCategory,
      setCatalogProductDetails,
      setProducts,
      showHiddenCatalogProducts,
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
      setMyProductsTotal((prev) => (prev != null ? prev + 1 : prev));
      setProducts((prev) => {
        const id = String(product._id);
        return [product, ...prev.filter((p) => String(p._id) !== id)];
      });
    },
    [goToMainView, setMyProductsCatalogNotice, setMyProductsTotal, setProducts],
  );

  const handlePlaceProductClick = useCallback(() => {
    if (isAtSellerProductsLimit) {
      setIsSellerProductsLimitModalOpen(true);
      return;
    }
    setCatalogProductDetails(null);
    setProductToEdit(null);
    setIsCreateProductModalOpen(true);
  }, [
    isAtSellerProductsLimit,
    setCatalogProductDetails,
    setIsCreateProductModalOpen,
    setIsSellerProductsLimitModalOpen,
    setProductToEdit,
  ]);

  const handleOpenEditMyProduct = useCallback(
    (product) => {
      if (product.productModerationStatus === PRODUCT_MODERATION_PENDING) {
        return;
      }
      setCatalogProductDetails(null);
      setProductToEdit(product);
    },
    [setCatalogProductDetails, setProductToEdit],
  );

  const handleCloseEditProductModal = useCallback(() => {
    setProductToEdit(null);
  }, [setProductToEdit]);

  const handleEditProductSuccess = useCallback(
    (product) => {
      syncCatalogProductState(product);
      setProductToEdit(null);
    },
    [setProductToEdit, syncCatalogProductState],
  );

  const handleAdminOpenEditProductFromDetails = useCallback(() => {
    if (!catalogProductDetails) {
      return;
    }
    setProductToEdit(catalogProductDetails);
    setCatalogProductDetails(null);
    setProductDetailsAdminError("");
  }, [
    catalogProductDetails,
    setCatalogProductDetails,
    setProductDetailsAdminError,
    setProductToEdit,
  ]);

  const handleSetMyProductAvailability = useCallback(
    async (productId, productIsAvailable) => {
      try {
        setTogglingAvailabilityProductId(productId);
        setMyProductsCatalogError("");
        const updated = await patchMyProduct(productId, { productIsAvailable });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        setMyProductsCatalogError(
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingAvailabilityProductId(null);
      }
    },
    [
      setMyProductsCatalogError,
      setTogglingAvailabilityProductId,
      syncCatalogProductState,
      syncProductEditModalState,
    ],
  );

  const handleSetProductAuction = useCallback(
    async (productId, productAuctionEnabled) => {
      try {
        setTogglingAuctionProductId(productId);
        setMyProductsCatalogError("");
        setProductDetailsAdminError("");
        const updated = await patchMyProduct(productId, { productAuctionEnabled });
        syncCatalogProductState(updated);
        syncProductEditModalState(updated);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK;
        if (catalogProductDetails && String(catalogProductDetails._id) === productId) {
          setProductDetailsAdminError(message);
        } else {
          setMyProductsCatalogError(message);
        }
      } finally {
        setTogglingAuctionProductId(null);
      }
    },
    [
      catalogProductDetails,
      setMyProductsCatalogError,
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
        await deleteMyProduct(productId);
        setProducts((prev) => prev.filter((p) => String(p._id) !== productId));
        setProductToEdit((prev) =>
          prev && String(prev._id) === productId ? null : prev,
        );
        setCatalogProductDetails((prev) =>
          prev && String(prev._id) === productId ? null : prev,
        );
        setMyProductsTotal((prev) => (prev != null && prev > 0 ? prev - 1 : prev));
      } catch (e) {
        setMyProductsCatalogError(
          e instanceof Error ? e.message : API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setDeletingProductId(null);
      }
    },
    [
      setCatalogProductDetails,
      setDeletingProductId,
      setMyProductsCatalogError,
      setMyProductsTotal,
      setProductToEdit,
      setProducts,
    ],
  );

  const handleOpenPromotionModal = useCallback(
    async (product) => {
      setPromotionProduct(product);
      setPromotionModalError("");
      try {
        const tariffs = await fetchProductPromotionTariffs();
        setPromotionTariffs(tariffs);
      } catch (e) {
        setPromotionModalError(
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.FETCH_PRODUCT_PROMOTION_TARIFFS_FALLBACK,
        );
        setPromotionTariffs([]);
      }
    },
    [setPromotionModalError, setPromotionProduct, setPromotionTariffs],
  );

  const handleClosePromotionModal = useCallback(() => {
    setPromotionProduct(null);
    setPromotionTariffs([]);
    setPromotionModalError("");
  }, [setPromotionModalError, setPromotionProduct, setPromotionTariffs]);

  const handleSubmitPromotionRequest = useCallback(
    async (tariffCode) => {
      if (!promotionProduct?._id) {
        return;
      }
      setIsPromotionSubmitPending(true);
      setPromotionModalError("");
      try {
        const { loyaltyPointsBalance, message } = await requestProductPromotion(
          String(promotionProduct._id),
          { tariffCode },
        );
        if (loyaltyPointsBalance != null) {
          setLoyaltyPoints(loyaltyPointsBalance);
        }
        setMyProductsCatalogNotice(message ?? "Заявка на продвижение отправлена.");
        void refreshMyPromotionPendingIds();
        setCatalogRefreshTick((n) => n + 1);
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
      refreshMyPromotionPendingIds,
      setCatalogRefreshTick,
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
        const updated = await setProductRaffleParticipation(productId, enabled);
        setProducts((prev) =>
          prev.map((row) => (String(row._id) === productId ? updated : row)),
        );
        syncProductEditModalState(updated);
        setRaffleRefreshTick((n) => n + 1);
        void refreshFeaturedRaffle();
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
      refreshFeaturedRaffle,
      setMyProductsCatalogError,
      setProducts,
      setRaffleParticipationPendingProductId,
      setRaffleRefreshTick,
      syncProductEditModalState,
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
