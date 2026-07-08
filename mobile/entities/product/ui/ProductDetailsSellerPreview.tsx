import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { formatSearchRowRatingCompact } from "@/entities/user/lib/formatSearchRowRating";
import { formatSearchRowTotalSales } from "@/entities/user/lib/formatSearchRowTotalSales";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import {
  PRODUCT_SELLER_PREVIEW_UI,
  USER_LIST_ROW_UI,
  USER_PROFILE_COPY,
} from "@/shared/config";
import { useProductDetailsSellerPreviewStyles } from "@/shared/theme/catalogProductStyles";

type SellerObject = {
  _id: string;
  userName?: string;
  isPremiumUser?: boolean;
  isUserDataConfirmed?: boolean;
  userRatingByVotes?: { countVotes?: number; totalRating?: number };
  sellerListedProductCount?: number;
  sellerListedProductsCount?: number;
  totalSalesAmount?: number;
  followersCount?: number;
};

type ProductDetailsSellerPreviewProps = {
  seller: unknown;
};

const formatFollowersCount = (value?: number): string => {
  if (value == null) {
    return "0";
  }

  return String(Math.max(0, Math.floor(Number(value)) || 0));
};

export const ProductDetailsSellerPreview = ({ seller }: ProductDetailsSellerPreviewProps) => {
  const router = useRouter();
  const styles = useProductDetailsSellerPreviewStyles();

  if (seller == null || typeof seller !== "object" || !("_id" in seller)) {
    return null;
  }

  const sellerObj = seller as SellerObject;
  const sellerId = String(sellerObj._id);
  const displayName = sellerObj.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const isPremium = sellerObj.isPremiumUser === true;
  const isConfirmed = sellerObj.isUserDataConfirmed === true;
  const listedRaw = sellerObj.sellerListedProductCount ?? sellerObj.sellerListedProductsCount;
  const listedCount = Number(listedRaw);
  const listedProductsText = Number.isFinite(listedCount)
    ? String(Math.max(0, Math.floor(listedCount)))
    : "0";

  const metrics = [
    {
      key: "rating",
      label: USER_LIST_ROW_UI.RATING_LABEL,
      value: formatSearchRowRatingCompact(sellerObj.userRatingByVotes),
    },
    {
      key: "totalSales",
      label: USER_PROFILE_COPY.LABELS.totalSalesAmount,
      value: formatSearchRowTotalSales(sellerObj.totalSalesAmount),
    },
    {
      key: "listed",
      label: PRODUCT_SELLER_PREVIEW_UI.LISTED_PRODUCTS_LABEL,
      value: listedProductsText,
    },
    {
      key: "followers",
      label: USER_LIST_ROW_UI.FOLLOWERS_LABEL,
      value: formatFollowersCount(sellerObj.followersCount),
    },
  ];

  const handleOpenProfile = () => {
    router.push(`/user/${sellerId}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.root, pressed && styles.rootPressed]}
      onPress={handleOpenProfile}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_SELLER_PREVIEW_UI.OPEN_PROFILE_ARIA}
    >
      <Text style={styles.label}>{PRODUCT_SELLER_PREVIEW_UI.SECTION_LABEL}</Text>
      <UserPremiumDisplayName
        name={displayName}
        isPremium={isPremium}
        isUserDataConfirmed={isConfirmed}
        textStyle={styles.nameText}
        badgeSize={16}
      />
      <View style={styles.metrics}>
        {metrics.map((row) => (
          <View key={row.key} style={styles.metric}>
            <Text style={styles.metricKey}>{row.label}</Text>
            <Text style={styles.metricValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
};
