import { StyleSheet, Text, View } from "react-native";

import { UserFollowButton } from "@/features/user-follow/ui/UserFollowButton";
import { PRODUCT_SELLER_PREVIEW_UI } from "@/shared/config";

import { getProductSellerDisplayName } from "../lib/getProductSellerDisplayName";

type SellerObject = {
  _id: string;
  userName?: string;
  isPremiumUser?: boolean;
  isFollowing?: boolean;
  sellerListedProductsCount?: number;
};

type ProductSellerPreviewProps = {
  seller: unknown;
  isAuthorized: boolean;
  currentUserId: string | null;
};

export const ProductSellerPreview = ({
  seller,
  isAuthorized,
  currentUserId,
}: ProductSellerPreviewProps) => {
  if (seller == null || typeof seller !== "object" || !("_id" in seller)) {
    return null;
  }

  const sellerObj = seller as SellerObject;
  const sellerId = String(sellerObj._id);
  const sellerName = getProductSellerDisplayName({ productSeller: sellerObj });
  const isSelf = currentUserId != null && sellerId === String(currentUserId);
  const listedCount = sellerObj.sellerListedProductsCount;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{PRODUCT_SELLER_PREVIEW_UI.SECTION_LABEL}</Text>
      <Text style={styles.name}>{sellerName}</Text>
      {listedCount != null ? (
        <Text style={styles.meta}>
          {PRODUCT_SELLER_PREVIEW_UI.LISTED_PRODUCTS_LABEL}: {listedCount}
        </Text>
      ) : null}
      {sellerObj.isPremiumUser ? (
        <Text style={styles.premium}>Premium</Text>
      ) : null}
      <UserFollowButton
        targetUserId={sellerId}
        isFollowing={sellerObj.isFollowing === true}
        isAuthorized={isAuthorized}
        isSelf={isSelf}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    gap: 8,
  },
  heading: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  meta: {
    fontSize: 14,
    color: "#444",
  },
  premium: {
    fontSize: 13,
    fontWeight: "600",
    color: "#d97706",
  },
});
