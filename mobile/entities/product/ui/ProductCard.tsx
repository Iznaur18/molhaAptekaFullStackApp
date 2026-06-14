import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useProductCardChromeFlags } from "@/entities/product/lib/useProductCardChromeFlags";
import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";
import { ProductCatalogStatusBadges } from "@/entities/product/ui/ProductCatalogStatusBadges";
import {
  ProductDiscountBadge,
  ProductPriceDisplay,
} from "@/entities/product/ui/ProductPriceDisplay";
import { WishlistToggleButton } from "@/features/wishlist-toggle/ui/WishlistToggleButton";
import { PRODUCT_CARD_UI, PRODUCT_UI } from "@/shared/config";
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    position: "relative",
    margin: 6,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
  },
  pressable: {
    flex: 1,
  },
  cardPressed: {
    opacity: 0.85,
  },
  wishlistSlot: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
  },
  imageWrap: {
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f4f4f4",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  unavailableBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  unavailableText: {
    fontSize: 10,
    color: "#fff",
  },
  name: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#222",
  },
  rating: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
});
