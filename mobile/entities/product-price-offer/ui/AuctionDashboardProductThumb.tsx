import { useState } from "react";
import { Image, Text, View } from "react-native";

import type { PriceOfferProductPreview } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { resolvePriceOfferProductImageUrl } from "@/entities/product-price-offer/lib/resolvePriceOfferProductImageUrl";
import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";

type AuctionDashboardProductThumbProps = {
  product?: PriceOfferProductPreview | null;
};

export const AuctionDashboardProductThumb = ({
  product,
}: AuctionDashboardProductThumbProps) => {
  const styles = useAuctionDashboardRowStyles();
  const [failed, setFailed] = useState(false);
  const imageUrl = failed ? null : resolvePriceOfferProductImageUrl(product);

  if (!imageUrl) {
    return (
      <View style={styles.thumbSlot}>
        <View style={styles.thumbPlaceholder}>
          <Text style={styles.thumbPlaceholderText}>—</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.thumbSlot}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.thumb}
        accessibilityIgnoresInvertColors
        onError={() => setFailed(true)}
      />
    </View>
  );
};
