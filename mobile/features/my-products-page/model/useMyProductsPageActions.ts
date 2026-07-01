import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { useRequestProductPromotionMutation } from "@/entities/product/model/useRequestProductPromotionMutation";
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

  const [catalogNotice, setCatalogNotice] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [promotionProduct, setPromotionProduct] = useState<MyProductsCatalogProduct | null>(null);
  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [promotionErrorMessage, setPromotionErrorMessage] = useState("");

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
    setPromotionModalVisible(true);
  }, []);

  const handleClosePromotionModal = useCallback(() => {
    setPromotionModalVisible(false);
    setPromotionProduct(null);
    setPromotionErrorMessage("");
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

  return {
    catalogNotice,
    setCatalogNotice,
    catalogError,
    setCatalogError,
    promotionProduct,
    promotionModalVisible,
    promotionErrorMessage,
    isPromotionSubmitting: requestPromotionMutation.isPending,
    handleEditProduct,
    handlePromoteProduct,
    handleClosePromotionModal,
    handleSubmitPromotion,
  };
};
