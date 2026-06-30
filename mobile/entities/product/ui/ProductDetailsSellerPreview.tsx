import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { formatSearchRowRatingCompact } from "@/entities/user/lib/formatSearchRowRating";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import {
  FORMAT_BOOLEAN_RU,
  PRODUCT_SELLER_PREVIEW_UI,
  USER_LIST_ROW_UI,
  USER_PROFILE_COPY,
} from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { useProductDetailsSellerPreviewStyles } from "@/shared/theme/catalogProductStyles";

type SellerObject = {
  _id: string;
  userName?: string;
  email?: string;
  userPhoneNumber?: string;
  userAddress?: string;
  createdAt?: string;
  isPremiumUser?: boolean;
  isUserDataConfirmed?: boolean;
  userRatingByVotes?: { countVotes?: number; totalRating?: number };
  sellerListedProductCount?: number;
  sellerListedProductsCount?: number;
};

type ProductDetailsSellerPreviewProps = {
  seller: unknown;
};

const formatOptionalText = (value?: string): string => {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : "—";
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

  const ratingText = useMemo(
    () => formatSearchRowRatingCompact(sellerObj.userRatingByVotes),
    [sellerObj.userRatingByVotes],
  );

  const metrics = [
    { key: "rating", label: USER_LIST_ROW_UI.RATING_LABEL, value: ratingText },
    {
      key: "confirmed",
      label: USER_LIST_ROW_UI.USER_DATA_CONFIRMED_LABEL,
      value: isConfirmed ? FORMAT_BOOLEAN_RU.YES : FORMAT_BOOLEAN_RU.NO,
    },
    {
      key: "premium",
      label: PRODUCT_SELLER_PREVIEW_UI.PREMIUM_LABEL,
      value: isPremium ? FORMAT_BOOLEAN_RU.YES : FORMAT_BOOLEAN_RU.NO,
    },
    { key: "email", label: USER_PROFILE_COPY.LABELS.email, value: formatOptionalText(sellerObj.email) },
    {
      key: "phone",
      label: USER_PROFILE_COPY.LABELS.userPhoneNumber,
      value: formatOptionalText(sellerObj.userPhoneNumber),
    },
    {
      key: "address",
      label: USER_PROFILE_COPY.LABELS.userAddress,
      value: formatOptionalText(sellerObj.userAddress),
    },
    {
      key: "createdAt",
      label: USER_PROFILE_COPY.LABELS.createdAt,
      value:
        typeof sellerObj.createdAt === "string"
          ? formatIsoDateTime(sellerObj.createdAt)
          : "—",
    },
    {
      key: "listed",
      label: PRODUCT_SELLER_PREVIEW_UI.LISTED_PRODUCTS_LABEL,
      value: listedProductsText,
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
