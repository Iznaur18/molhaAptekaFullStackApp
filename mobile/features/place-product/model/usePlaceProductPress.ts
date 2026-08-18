import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { getSellerProductsLimit } from "@/entities/product/lib/sellerProductsLimit";
import { useMyProductsTotalQuery } from "@/entities/product/model/useMyProductsTotalQuery";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { setProductCopyDraft } from "@/features/create-product/model/productCopyDraftStore";

export const usePlaceProductPress = () => {
  const router = useRouter();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const { isAdmin, isPremiumUser } = useUserAccess();
  const myProductsTotalQuery = useMyProductsTotalQuery({ enabled: isAuthorized });
  const [limitModalVisible, setLimitModalVisible] = useState(false);

  const sellerProductsLimit = useMemo(() => {
    if (isAdmin) {
      return null;
    }
    return getSellerProductsLimit(sessionQuery.data?.user);
  }, [isAdmin, sessionQuery.data?.user]);

  const myProductsTotal = myProductsTotalQuery.myProductsTotal;
  const isAtSellerProductsLimit =
    sellerProductsLimit != null &&
    myProductsTotal != null &&
    myProductsTotal >= sellerProductsLimit;

  const handlePlaceProductPress = useCallback(() => {
    if (!isAuthorized) {
      router.push("/(auth)/login");
      return;
    }
    if (isAtSellerProductsLimit) {
      setLimitModalVisible(true);
      return;
    }
    setProductCopyDraft(null);
    router.push("/create-product");
  }, [isAtSellerProductsLimit, isAuthorized, router]);

  const handleCopyProductPress = useCallback(
    (product: Record<string, unknown>) => {
      if (!isAuthorized) {
        router.push("/(auth)/login");
        return;
      }
      if (isAtSellerProductsLimit) {
        setLimitModalVisible(true);
        return;
      }
      setProductCopyDraft(product);
      router.push("/create-product");
    },
    [isAtSellerProductsLimit, isAuthorized, router],
  );

  const closeLimitModal = useCallback(() => {
    setLimitModalVisible(false);
  }, []);

  return {
    handlePlaceProductPress,
    handleCopyProductPress,
    limitModalVisible,
    closeLimitModal,
    sellerProductsLimit,
    isPremiumUser,
    isAtSellerProductsLimit,
  };
};
