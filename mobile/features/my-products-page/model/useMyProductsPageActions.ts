import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { setProductInstallmentEnabled } from "@/entities/installment/lib/setProductInstallmentEnabled";
import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { useRequestProductPromotionMutation } from "@/entities/product/model/useRequestProductPromotionMutation";
import { useProductPromotionManageSupport } from "@/features/product-promotion/model/useProductPromotionManageSupport";
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
  const [togglingWholesaleProductId, setTogglingWholesaleProductId] = useState<string | null>(
    null,
  );
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
    isWholesaleTogglePending:
      promotionProductId != null && togglingWholesaleProductId === promotionProductId,
    isInstallmentTogglePending:
      promotionProductId != null && togglingInstallmentProductId === promotionProductId,
    isDeletePending: deleteMutation.isPending,
    handleEditProduct,
    handlePromoteProduct,
    handleClosePromotionModal,
    handleSubmitPromotion,
    handleSetMyProductAvailability,
    handleSetProductAuction,
    handleSetProductWholesale,
    handleSetProductInstallment,
    handleWholesaleSaved,
    handleDeleteProduct,
    sellerRaffleActive: manageSupport.sellerRaffleActive,
    handleToggleRaffleParticipation: manageSupport.handleToggleRaffleParticipation,
    isRaffleParticipationPending: manageSupport.isRaffleParticipationPending,
    handleInstallmentProgramSaved,
  };
};
