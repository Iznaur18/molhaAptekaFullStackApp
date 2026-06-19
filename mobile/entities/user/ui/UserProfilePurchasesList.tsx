import { useRouter } from "expo-router";

import { useUserPurchasesQuery } from "@/entities/user/model/useUserPurchasesQuery";
import type { UserProfileThumbItem } from "@/entities/user/model/userProfileThumbTypes";
import { UserProfileThumbSection } from "@/entities/user/ui/UserProfileThumbSection";
import {
  API_CLIENT_UI,
  USER_PROFILE_PURCHASES_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

type UserProfilePurchasesListProps = {
  targetUserId: string;
};

export const UserProfilePurchasesList = ({ targetUserId }: UserProfilePurchasesListProps) => {
  const router = useRouter();
  const purchasesQuery = useUserPurchasesQuery({ userId: targetUserId });

  const items = (purchasesQuery.data ?? []) as UserProfileThumbItem[];
  const phase = purchasesQuery.isPending
    ? "loading"
    : purchasesQuery.isError
      ? "error"
      : "success";
  const errorText = formatApiErrorMessage(
    purchasesQuery.error,
    API_CLIENT_UI.FETCH_USER_PURCHASES_FALLBACK,
  );

  const handleProductPress = (item: UserProfileThumbItem) => {
    if (!item.product?._id) {
      return;
    }
    router.push({ pathname: "/product/[id]", params: { id: String(item.product._id) } });
  };

  return (
    <UserProfileThumbSection
      heading={USER_PROFILE_PURCHASES_UI.HEADING}
      phase={phase}
      items={items}
      loadingText={USER_PROFILE_PURCHASES_UI.LOADING}
      emptyText={USER_PROFILE_PURCHASES_UI.EMPTY}
      errorText={errorText}
      unavailableText={USER_PROFILE_PURCHASES_UI.UNAVAILABLE}
      onItemPress={handleProductPress}
    />
  );
};
