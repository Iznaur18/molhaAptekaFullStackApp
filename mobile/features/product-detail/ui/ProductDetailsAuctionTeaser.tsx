import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useTopPriceOffersQuery } from "@/entities/product-price-offer/model/useTopPriceOffersQuery";
import { PRODUCT_PRICE_OFFER_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailsAuctionTeaserProps = {
  productId: string;
  auctionActive: boolean;
  onPress: () => void;
};

export const ProductDetailsAuctionTeaser = ({
  productId,
  auctionActive,
  onPress,
}: ProductDetailsAuctionTeaserProps) => {
  const theme = useAppTheme();
  const styles = useProductDetailScreenStyles();
  const offersQuery = useTopPriceOffersQuery(productId, auctionActive);
  const topOffer = offersQuery.data?.[0];
  const topPrice =
    topOffer != null && Number.isFinite(Number(topOffer.offerPrice))
      ? Number(topOffer.offerPrice)
      : null;

  if (!auctionActive) {
    return null;
  }

  const subtitle =
    topPrice != null
      ? PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_BEST_OFFER(formatPriceRub(topPrice))
      : PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_NO_OFFERS;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.featureCard,
        pressed ? { opacity: 0.92, borderColor: theme.colors.actionBorder } : null,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_ARIA}
    >
      <View style={styles.featureCardIcon}>
        <MaterialIcons name="gavel" size={20} color={theme.colors.action} />
      </View>
      <View style={styles.featureCardText}>
        <Text style={styles.featureCardTitle}>
          {PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_TITLE}
        </Text>
        <Text style={styles.featureCardSubtitle}>{subtitle}</Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={22}
        color={theme.colors.action}
        style={styles.featureCardChevron}
      />
    </Pressable>
  );
};
