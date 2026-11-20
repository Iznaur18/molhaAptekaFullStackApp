import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  formatLoyaltyPointsAmount,
  isProductPointsSaleActive,
} from "@molha/api-contract";

import type { BoostHomeProduct } from "@/entities/product/api/fetchProductPromotionBoostProducts";
import { resolveProductCatalogPriceRub } from "@/entities/product/lib/resolveProductCatalogPriceRub";
import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";
import { WishlistToggleButton } from "@/features/wishlist-toggle/ui/WishlistToggleButton";
import { CURATED_PRODUCT_COMPACT_CARD_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useBoostProductMiniCardStyles } from "@/shared/theme/boostProductsHomeStyles";

type BoostProductMiniCardProps = {
  product: BoostHomeProduct;
  width: number;
  onOpen?: () => void;
};

export const BoostProductMiniCard = ({
  product,
  width,
  onOpen,
}: BoostProductMiniCardProps) => {
  const router = useRouter();
  const styles = useBoostProductMiniCardStyles();
  const imageUrls = resolveProductImageUrls(product);
  const imageUrl = imageUrls[0] ?? "";
  const priceLabel = isProductPointsSaleActive(product)
    ? formatLoyaltyPointsAmount(product.productPointsPrice)
    : formatPriceRub(resolveProductCatalogPriceRub(product));
  const productName = String(product.productName ?? "").trim();
  const openLabel = CURATED_PRODUCT_COMPACT_CARD_UI.OPEN_ARIA(productName);

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
      return;
    }
    router.push(`/product/${product._id}` as never);
  };

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.media}>
        <Pressable
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel={openLabel}
          style={{ flex: 1 }}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <Text style={styles.imageFallback}>
              {CURATED_PRODUCT_COMPACT_CARD_UI.NO_IMAGE}
            </Text>
          )}
        </Pressable>
        <Pressable
          style={styles.priceWrap}
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel={openLabel}
        >
          <Text style={styles.price} numberOfLines={1}>
            {priceLabel}
          </Text>
        </Pressable>
        <View style={styles.wishlistSlot}>
          <WishlistToggleButton
            productId={String(product._id)}
            product={product}
            variant="card"
          />
        </View>
      </View>
    </View>
  );
};
