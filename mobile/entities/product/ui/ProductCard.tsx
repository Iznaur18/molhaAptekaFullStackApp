import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PRODUCT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

import { resolveProductImageUrl } from "../lib/resolveProductImageUrl";

type ProductCardProps = {
  product: {
    _id: string;
    productName?: string;
    productPrice?: number;
    productIsAvailable?: boolean;
    productImageUrls?: unknown;
    productImageUrl?: unknown;
  };
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const imageUrl = resolveProductImageUrl(product);
  const name = product.productName?.trim() || "Без названия";
  const isAvailable = product.productIsAvailable !== false;

  const handlePress = () => {
    router.push({ pathname: "/product/[id]", params: { id: product._id } });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_UI.OPEN_ARIA(name)}
    >
      <View style={styles.imageWrap}>
        <CachedProductImage uri={imageUrl} style={styles.image} />
        {!isAvailable ? (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>{PRODUCT_UI.UNAVAILABLE}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      <Text style={styles.price}>{formatPriceRub(product.productPrice)}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
  },
  cardPressed: {
    opacity: 0.85,
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
  price: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
});
