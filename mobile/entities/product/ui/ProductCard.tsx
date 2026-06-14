import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useProductCardChromeFlags } from "@/entities/product/lib/useProductCardChromeFlags";
import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";
import { ProductCatalogStatusBadges } from "@/entities/product/ui/ProductCatalogStatusBadges";
import {
  ProductDiscountBadge,
  ProductPriceDisplay,
} from "@/entities/product/ui/ProductPriceDisplay";
import { WishlistToggleButton } from "@/features/wishlist-toggle/ui/WishlistToggleButton";
import { PRODUCT_CARD_UI, PRODUCT_UI } from "@/shared/config";
import { useProductCardStyles } from "@/shared/theme/catalogProductStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

type ProductCardProps = {
  product: Record<string, unknown> & {
    _id: string;
    productName?: string;
    productPrice?: number;
    productIsAvailable?: boolean;
    productImageUrls?: unknown;
    productImageUrl?: unknown;
    productSeller?: string | { _id?: string } | null;
    averageRating?: number;
    reviewCount?: number;
  };
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const styles = useProductCardStyles();
  const imageUrl = resolveProductImageUrl(product);
  const name = product.productName?.trim() || "Без названия";
  const isAvailable = product.productIsAvailable !== false;
  const flags = useProductCardChromeFlags(product);
  const averageRating = Number(product.averageRating);
  const reviewCount = Number(product.reviewCount);
  const showRating =
    Number.isFinite(averageRating) && Number.isFinite(reviewCount) && reviewCount > 0;

  const handlePress = () => {
    router.push({ pathname: "/product/[id]", params: { id: product._id } });
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={({ pressed }) => [styles.pressable, pressed && styles.cardPressed]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={PRODUCT_UI.OPEN_ARIA(name)}
      >
        <View style={styles.imageWrap}>
          <CachedProductImage uri={imageUrl} style={styles.image} />
          {flags.showDiscountBadge ? (
            <ProductDiscountBadge product={product} variant="overlay" />
          ) : null}
          {!isAvailable ? (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>{PRODUCT_UI.UNAVAILABLE}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <ProductPriceDisplay product={product} showLabel={false} variant="card" />
        {showRating ? (
          <Text style={styles.rating}>
            {PRODUCT_CARD_UI.RATING_LINE(averageRating, reviewCount)}
          </Text>
        ) : null}
        <ProductCatalogStatusBadges product={product} />
      </Pressable>
      <View style={styles.wishlistSlot}>
        <WishlistToggleButton productId={product._id} product={product} variant="card" />
      </View>
    </View>
  );
};
