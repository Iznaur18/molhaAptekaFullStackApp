import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  buildAffiliateManageToggleBody,
  resolveAffiliateEnableLoyaltyGate,
  resolveAffiliateToggleSourceProduct,
} from "@izibuy/shared-lib";

import { setProductInstallmentEnabled } from "@/entities/installment/lib/setProductInstallmentEnabled";
import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { useRequestProductPromotionMutation } from "@/entities/product/model/useRequestProductPromotionMutation";
import { useProductPromotionManageSupport } from "@/features/product-promotion/model/useProductPromotionManageSupport";
import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import {
  API_CLIENT_UI,
  PRODUCT_PROMOTION_UI,
} from "@/shared/config";
import { catalogQueryKeys, loyaltyPointsQueryKeys, myProductsQueryKeys } from "@/shared/api";

type MyProductsCatalogProduct = Record<string, unknown> & { _id: string };

export const useMyProductsPageActions = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const requestPromotionMutation = useRequestProductPromotionMutation();
  const { patchMutation, deleteMutation } = useMyProductMutations();
  const loyaltyStatusQuery = useMyLoyaltyPointsStatusQuery(true);

  const [catalogNotice, setCatalogNotice] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [promotionProduct, setPromotionProduct] = useState<MyProductsCatalogProduct | null>(null);
  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [promotionErrorMessage, setPromotionErrorMessage] = useState("");
  const [manageErrorMessage, setManageErrorMessage] = useState("");
  const [togglingAvailabilityProductId, setTogglingAvailabilityProductId] = useState<string | null>(
    null,
  );
  const [togglingAuctionProductId, setTogglingAuctionProductId] = useState<string | null>(null);
  const [togglingOriginalityProductId, setTogglingOriginalityProductId] = useState<string | null>(
    null,
  );
  const [togglingOutOfStockProductId, setTogglingOutOfStockProductId] = useState<string | null>(
    null,
  );
  const [togglingWholesaleProductId, setTogglingWholesaleProductId] = useState<string | null>(
    null,
  );
  const [togglingBuyNFreeProductId, setTogglingBuyNFreeProductId] = useState<string | null>(null);
  const [togglingRentalProductId, setTogglingRentalProductId] = useState<string | null>(null);
  const [togglingQaProductId, setTogglingQaProductId] = useState<string | null>(null);
  const [togglingFlashSaleProductId, setTogglingFlashSaleProductId] = useState<string | null>(
    null,
  );
  const [togglingAffiliateProductId, setTogglingAffiliateProductId] = useState<string | null>(
    null,
  );
  const [togglingLoyaltyProductId, setTogglingLoyaltyProductId] = useState<string | null>(null);
  const [togglingInstallmentProductId, setTogglingInstallmentProductId] = useState<string | null>(
    null,
  );

  const syncPromotionProduct = useCallback((updated: MyProductsCatalogProduct) => {
    setPromotionProduct((prev) =>
      prev && String(prev._id) === String(updated._id) ? { ...prev, ...updated } : prev,
    );
  }, []);

  const manageSupport = useProductPromotionManageSupport({
    product: promotionProduct,
    syncProduct: syncPromotionProduct,
    setManageErrorMessage,
    enabled: promotionModalVisible,
  });

  const handleEditProduct = useCallback(
    (product: MyProductsCatalogProduct) => {
      router.push({
        pathname: "/edit-product/[id]",
        params: { id: String(product._id) },
      });
    },
    [router],
  );

  const handlePromoteProduct = useCallback((product: MyProductsCatalogProduct) => {
    setPromotionProduct(product);
    setPromotionErrorMessage("");
    setManageErrorMessage("");
    setPromotionModalVisible(true);
  }, []);

  const handleClosePromotionModal = useCallback(() => {
    setPromotionModalVisible(false);
    setPromotionProduct(null);
    setPromotionErrorMessage("");
    setManageErrorMessage("");
  }, []);

  const handleSubmitPromotion = useCallback(
    async (tier: number, tariffCode: string) => {
      if (!promotionProduct?._id) {
        return;
      }

      setPromotionErrorMessage("");
      try {
        const result = await requestPromotionMutation.mutateAsync({
          productId: String(promotionProduct._id),
          tier,
          tariffCode,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: myProductsQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.status() }),
        ]);
        setCatalogNotice(result.message ?? PRODUCT_PROMOTION_UI.SUCCESS_DEFAULT);
        handleClosePromotionModal();
      } catch (error) {
        setPromotionErrorMessage(
          error instanceof Error
            ? error.message
            : API_CLIENT_UI.REQUEST_PRODUCT_PROMOTION_FALLBACK,
        );
      }
    },
    [
      handleClosePromotionModal,
      promotionProduct,
      queryClient,
      requestPromotionMutation,
    ],
  );

  const handleSetMyProductAvailability = useCallback(
    async (productId: string, isAvailable: boolean) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }

      setTogglingAvailabilityProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productIsAvailable: isAvailable },
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingAvailabilityProductId(null);
      }
    },
    [patchMutation, syncPromotionProduct],
  );

  const handleSetProductAuction = useCallback(
    async (productId: string, auctionEnabled: boolean) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }

      setTogglingAuctionProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productAuctionEnabled: auctionEnabled },
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingAuctionProductId(null);
      }
    },
    [patchMutation, syncPromotionProduct],
  );

  const handleSetProductOriginality = useCallback(
    async (productId: string, isOriginal: boolean) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }

      setTogglingOriginalityProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productIsOriginal: isOriginal },
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingOriginalityProductId(null);
      }
    },
    [patchMutation, syncPromotionProduct],
  );

  const handleSetProductOutOfStock = useCallback(
    async (productId: string, outOfStock: boolean) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }

      setTogglingOutOfStockProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productOutOfStock: outOfStock },
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingOutOfStockProductId(null);
      }
    },
    [patchMutation, syncPromotionProduct],
  );

  const handleSetProductWholesale = useCallback(
    async (productId: string, wholesaleEnabled: boolean) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }

      setTogglingWholesaleProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productWholesaleEnabled: wholesaleEnabled },
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingWholesaleProductId(null);
      }
    },
    [patchMutation, syncPromotionProduct],
  );

  const handleSetProductBuyNFree = useCallback(
    async (productId: string, buyNFreeEnabled: boolean) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }

      setTogglingBuyNFreeProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productBuyNFreeEnabled: buyNFreeEnabled },
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingBuyNFreeProductId(null);
      }
    },
    [patchMutation, syncPromotionProduct],
  );

  const handleSetProductRental = useCallback(
    async (productId: string, rentalEnabled: boolean) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }

      setTogglingRentalProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productRentalEnabled: rentalEnabled },
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingRentalProductId(null);
      }
    },
    [patchMutation, syncPromotionProduct],
  );

  /**
   * Только выключение: включение проходит через модалку — серверу нужны цена
   * и длительность, отдельного «просто включить» сценария нет.
   */
  const handleSetProductQa = useCallback(
    async (productId: string, qaEnabled: boolean) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }

      setTogglingQaProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productQaEnabled: qaEnabled },
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingQaProductId(null);
      }
    },
    [patchMutation, syncPromotionProduct],
  );

  const handleSetProductFlashSale = useCallback(
    async (productId: string, flashSaleEnabled: boolean) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }

      setTogglingFlashSaleProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { productFlashSaleEnabled: flashSaleEnabled },
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingFlashSaleProductId(null);
      }
    },
    [patchMutation, syncPromotionProduct],
  );

  const handleSetProductAffiliate = useCallback(
    async (
      productId: string,
      affiliateEnabled: boolean,
      productHint?: MyProductsCatalogProduct,
    ) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }

      setTogglingAffiliateProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const sourceProduct = resolveAffiliateToggleSourceProduct(normalizedProductId, [
          productHint,
          promotionProduct,
        ]);
        if (affiliateEnabled && sourceProduct?.affiliateEnabled !== true) {
          const gate = resolveAffiliateEnableLoyaltyGate({
            productPrice: sourceProduct?.productPrice,
            affiliatePercent: sourceProduct?.affiliatePercent,
            loyaltyPointsBalance: loyaltyStatusQuery.data?.loyaltyPointsBalance ?? 0,
            loyaltyPointsReserved: loyaltyStatusQuery.data?.loyaltyPointsReserved ?? 0,
          });
          if (!gate.ok) {
            setManageErrorMessage(gate.message);
            return;
          }
        }
        const body = buildAffiliateManageToggleBody(sourceProduct, affiliateEnabled);
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body,
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingAffiliateProductId(null);
      }
    },
    [loyaltyStatusQuery.data, patchMutation, promotionProduct, syncPromotionProduct],
  );

  const handleSetProductLoyaltyPoints = useCallback(
    async (productId: string, loyaltyPointsPerUnit: number) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return;
      }
      const nextPoints = Math.max(0, Math.floor(Number(loyaltyPointsPerUnit)) || 0);
      setTogglingLoyaltyProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const updated = await patchMutation.mutateAsync({
          productId: normalizedProductId,
          body: { loyaltyPointsPerUnit: nextPoints },
        });
        syncPromotionProduct(updated as MyProductsCatalogProduct);
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
      } finally {
        setTogglingLoyaltyProductId(null);
      }
    },
    [patchMutation, syncPromotionProduct],
  );

  const handleWholesaleSaved = useCallback(
    (updated: MyProductsCatalogProduct) => {
      syncPromotionProduct(updated);
    },
    [syncPromotionProduct],
  );

  const handleSetProductInstallment = useCallback(
    async (productId: string, installmentEnabled: boolean) => {
      const normalizedProductId = String(productId ?? "").trim();
      if (!normalizedProductId) {
        return undefined;
      }

      setTogglingInstallmentProductId(normalizedProductId);
      setManageErrorMessage("");
      try {
        const result = await setProductInstallmentEnabled(
          normalizedProductId,
          installmentEnabled,
        );
        if (result.needsSetup) {
          return { needsSetup: true };
        }
        const nextEnabled = result.productInstallmentEnabled === true;
        syncPromotionProduct({
          _id: normalizedProductId,
          productInstallmentEnabled: nextEnabled,
        } as MyProductsCatalogProduct);
        await queryClient.invalidateQueries({ queryKey: myProductsQueryKeys.all });
        return { productInstallmentEnabled: nextEnabled };
      } catch (error) {
        setManageErrorMessage(
          error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
        );
        return undefined;
      } finally {
        setTogglingInstallmentProductId(null);
      }
    },
    [queryClient, syncPromotionProduct],
  );

  const handleInstallmentProgramSaved = useCallback(
    async (productPatch?: Record<string, unknown>) => {
      manageSupport.handleInstallmentProgramSaved(productPatch);
      await queryClient.invalidateQueries({ queryKey: myProductsQueryKeys.all });
      handleClosePromotionModal();
    },
    [handleClosePromotionModal, manageSupport, queryClient],
  );

  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      setManageErrorMessage("");
      setCatalogError("");
      try {
        await deleteMutation.mutateAsync(productId);
        handleClosePromotionModal();
        setCatalogNotice("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK;
        setManageErrorMessage(message);
        setCatalogError(message);
      }
    },
    [deleteMutation, handleClosePromotionModal],
  );

  const promotionProductId = promotionProduct?._id != null ? String(promotionProduct._id) : null;

  return {
    catalogNotice,
    setCatalogNotice,
    catalogError,
    setCatalogError,
    promotionProduct,
    promotionModalVisible,
    promotionErrorMessage,
    manageErrorMessage,
    isPromotionSubmitting: requestPromotionMutation.isPending,
    isAvailabilityTogglePending:
      promotionProductId != null && togglingAvailabilityProductId === promotionProductId,
    isAuctionTogglePending:
      promotionProductId != null && togglingAuctionProductId === promotionProductId,
    isOriginalityTogglePending:
      promotionProductId != null && togglingOriginalityProductId === promotionProductId,
    isOutOfStockTogglePending:
      promotionProductId != null && togglingOutOfStockProductId === promotionProductId,
    isWholesaleTogglePending:
      promotionProductId != null && togglingWholesaleProductId === promotionProductId,
    isBuyNFreeTogglePending:
      promotionProductId != null && togglingBuyNFreeProductId === promotionProductId,
    isQaTogglePending:
      promotionProductId != null && togglingQaProductId === promotionProductId,
    isFlashSaleTogglePending:
      promotionProductId != null && togglingFlashSaleProductId === promotionProductId,
    isRentalTogglePending:
      promotionProductId != null && togglingRentalProductId === promotionProductId,
    isAffiliateTogglePending:
      promotionProductId != null && togglingAffiliateProductId === promotionProductId,
    isLoyaltyTogglePending:
      promotionProductId != null && togglingLoyaltyProductId === promotionProductId,
    isInstallmentTogglePending:
      promotionProductId != null && togglingInstallmentProductId === promotionProductId,
    isDeletePending: deleteMutation.isPending,
    handleEditProduct,
    handlePromoteProduct,
    handleClosePromotionModal,
    handleSubmitPromotion,
    handleSetMyProductAvailability,
    handleSetProductAuction,
    handleSetProductOriginality,
    handleSetProductOutOfStock,
    handleSetProductWholesale,
    handleSetProductBuyNFree,
    handleSetProductRental,
    handleSetProductQa,
    handleSetProductFlashSale,
    handleSetProductAffiliate,
    handleSetProductLoyaltyPoints,
    handleSetProductInstallment,
    handleWholesaleSaved,
    handleDeleteProduct,
    sellerRaffleActive: manageSupport.sellerRaffleActive,
    handleToggleRaffleParticipation: manageSupport.handleToggleRaffleParticipation,
    isRaffleParticipationPending: manageSupport.isRaffleParticipationPending,
    handleInstallmentProgramSaved,
  };
};
