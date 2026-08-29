import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { seedCatalogProductQueryCache } from "@/entities/product/lib/seedCatalogProductQueryCache";
import { useUserProfileProductsAllPagesQuery } from "@/entities/user/model/useUserProfileProductsAllPagesQuery";
import type { UserProfileThumbItem } from "@/entities/user/model/userProfileThumbTypes";
import {
  UserProfileThumbSection,
  type UserProfileThumbSectionLayout,
} from "@/entities/user/ui/UserProfileThumbSection";
import { API_CLIENT_UI, USER_PROFILE_PRODUCTS_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

type UserProfileProductsListProps = {
  targetUserId: string;
  onViewAllProducts?: () => void;
  hideWhenEmpty?: boolean;
  heading?: string;
  layout?: UserProfileThumbSectionLayout;
  currentProductId?: string;
  isSelf?: boolean;
};

export const UserProfileProductsList = ({
  targetUserId,
  onViewAllProducts,
  hideWhenEmpty = false,
  heading = USER_PROFILE_PRODUCTS_UI.HEADING,
  layout = "profile-scroll",
  currentProductId = "",
  isSelf = false,
}: UserProfileProductsListProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isHorizontal = layout === "horizontal";

  const productsQuery = useUserProfileProductsAllPagesQuery({
    userId: targetUserId,
    enabled: true,
  });

  const items = (productsQuery.data?.items ?? []) as UserProfileThumbItem[];
  const total = productsQuery.data?.pagination?.total ?? items.length;

  const phase = productsQuery.isPending
    ? "loading"
    : productsQuery.isError && items.length === 0
      ? "error"
      : "success";

  const displayError = formatApiErrorMessage(
    productsQuery.error,
    API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK,
  );

  if (hideWhenEmpty && isHorizontal) {
    if (phase === "loading") {
      return null;
    }
    if (phase === "error" && items.length === 0) {
      return null;
    }
    if (phase === "success" && total === 0) {
      return null;
    }
  }

  if (hideWhenEmpty && phase === "success" && total === 0) {
    return null;
  }

  const handleProductPress = (item: UserProfileThumbItem) => {
    if (!item.product?._id) {
      return;
    }
    const productId = String(item.product._id);
    seedCatalogProductQueryCache(queryClient, item.product as Record<string, unknown>);
    router.push({ pathname: "/product/[id]", params: { id: productId } });
  };

  return (
    <UserProfileThumbSection
      heading={heading}
      phase={phase}
      items={items}
      layout={layout}
      currentProductId={currentProductId}
      loadingText={USER_PROFILE_PRODUCTS_UI.LOADING}
      emptyText={USER_PROFILE_PRODUCTS_UI.EMPTY}
      errorText={phase === "error" ? displayError : ""}
      unavailableText={USER_PROFILE_PRODUCTS_UI.UNAVAILABLE}
      onItemPress={handleProductPress}
      onHeadingPress={onViewAllProducts}
      viewAllLabel={USER_PROFILE_PRODUCTS_UI.VIEW_ALL}
      onViewAllPress={onViewAllProducts}
      isSelf={isSelf}
      applySellerProductGates
    />
  );
};
