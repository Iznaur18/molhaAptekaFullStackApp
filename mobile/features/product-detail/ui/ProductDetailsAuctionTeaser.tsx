import { Pressable, Text, View } from "react-native";

import { useTopPriceOffersQuery } from "@/entities/product-price-offer/model/useTopPriceOffersQuery";
import { PRODUCT_PRICE_OFFER_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
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
      style={styles.installmentTeaser}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_ARIA}
    >
      <View style={styles.installmentTeaserCopy}>
        <Text style={styles.installmentTeaserTitle}>
          {PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_TITLE}
        </Text>
        <Text style={styles.installmentTeaserMonthly}>{subtitle}</Text>
      </View>
      <View style={styles.installmentTeaserGo}>
        <Text style={styles.installmentTeaserGoText}>
          {PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_GO}
        </Text>
      </View>
    </Pressable>
  );
};
