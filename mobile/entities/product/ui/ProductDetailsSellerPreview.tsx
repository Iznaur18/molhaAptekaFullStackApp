import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { formatSearchRowRatingCompact } from "@/entities/user/lib/formatSearchRowRating";
import { formatSearchRowTotalSales } from "@/entities/user/lib/formatSearchRowTotalSales";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { getUserAvatarFocus } from "@/entities/user/lib/profileImageFocus";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { UserPremiumAvatar } from "@/entities/user/ui/UserPremiumAvatar";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { PRODUCT_DETAILS_SELLER_PREVIEW_LAYOUT as SP } from "@/entities/product/lib/productDetailsSellerPreviewLayout";
import {
  PRODUCT_SELLER_PREVIEW_UI,
  USER_LIST_ROW_UI,
  USER_PROFILE_COPY,
} from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailsSellerPreviewStyles } from "@/shared/theme/catalogProductStyles";

type SellerObject = {
  _id: string;
  userName?: string;
  userAvatarUrl?: string;
  userAvatarFocus?: { x?: number; y?: number };
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
  presentation?: "default" | "split-rest";
};

const formatFollowersCount = (value?: number): string => {
  if (value == null) {
    return "0";
  }

  return String(Math.max(0, Math.floor(Number(value)) || 0));
};

export const ProductDetailsSellerPreview = ({
  seller,
  presentation = "default",
}: ProductDetailsSellerPreviewProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useProductDetailsSellerPreviewStyles();
  const [avatarFailed, setAvatarFailed] = useState(false);

  const sellerObj =
    seller != null && typeof seller === "object" && "_id" in seller
      ? (seller as SellerObject)
      : null;
  const sellerId = sellerObj != null ? String(sellerObj._id) : "";

  useEffect(() => {
    setAvatarFailed(false);
  }, [sellerId]);

  if (sellerObj == null || !sellerId) {
    return null;
  }

  const displayName = sellerObj.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const isPremium = sellerObj.isPremiumUser === true;
  const isConfirmed = sellerObj.isUserDataConfirmed === true;
  const listedRaw = sellerObj.sellerListedProductCount ?? sellerObj.sellerListedProductsCount;
  const listedCount = Number(listedRaw);
  const listedProductsText = Number.isFinite(listedCount)
    ? String(Math.max(0, Math.floor(listedCount)))
    : "0";

  const pickedAvatar = pickUserProfilePhotoUrl(sellerObj);
  const avatarUri =
    !avatarFailed && pickedAvatar ? pickedAvatar : DEFAULT_USER_AVATAR_URL;

  const metrics = [
    {
      key: "rating",
      label: USER_LIST_ROW_UI.RATING_LABEL,
      value: formatSearchRowRatingCompact(sellerObj.userRatingByVotes),
      icon: "star" as const,
    },
    {
      key: "totalSales",
      label: USER_PROFILE_COPY.LABELS.totalSalesAmount,
      value: formatSearchRowTotalSales(sellerObj.totalSalesAmount),
      icon: "credit-card" as const,
    },
    {
      key: "listed",
      label: PRODUCT_SELLER_PREVIEW_UI.LISTED_PRODUCTS_LABEL,
      value: listedProductsText,
      icon: "package" as const,
    },
    {
      key: "followers",
      label: USER_LIST_ROW_UI.FOLLOWERS_LABEL,
      value: formatFollowersCount(sellerObj.followersCount),
      icon: "users" as const,
    },
  ];

  const handleOpenProfile = () => {
    router.push(`/user/${sellerId}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.root,
        presentation === "split-rest" && styles.rootSplit,
        pressed && styles.rootPressed,
      ]}
      onPress={handleOpenProfile}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_SELLER_PREVIEW_UI.OPEN_PROFILE_ARIA}
    >
      <View style={styles.header}>
        <UserPremiumAvatar
          uri={avatarUri}
          isPremium={isPremium}
          focus={getUserAvatarFocus(sellerObj)}
          onError={() => setAvatarFailed(true)}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.label}>{PRODUCT_SELLER_PREVIEW_UI.SECTION_LABEL}</Text>
          <UserPremiumDisplayName
            name={displayName}
            isPremium={isPremium}
            isUserDataConfirmed={isConfirmed}
            textStyle={styles.nameText}
            badgeSize={16}
          />
        </View>
        <Feather
          name="chevron-right"
          size={SP.chevronSize}
          color={theme.colors.action}
          style={styles.chevron}
        />
      </View>

      <View style={styles.metrics}>
        {metrics.map((row) => (
          <View key={row.key} style={styles.metric}>
            <View style={styles.metricIcon}>
              <Feather name={row.icon} size={14} color={theme.colors.action} />
            </View>
            <View style={styles.metricBody}>
              <Text style={styles.metricValue} numberOfLines={1}>
                {row.value}
              </Text>
              <Text style={styles.metricKey} numberOfLines={1}>
                {row.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Pressable>
  );
};
