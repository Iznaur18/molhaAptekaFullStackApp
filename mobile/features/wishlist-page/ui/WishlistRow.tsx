import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";
import { useWishlist } from "@/entities/wishlist/model/WishlistProvider";
import { WISHLIST_PAGE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useWishlistRowStyles } from "@/shared/theme/wishlistPageStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

type WishlistProduct = {
  _id: string;
  productName?: string;
  productPrice?: number;
  productImageUrls?: unknown;
  productImageUrl?: unknown;
};

type WishlistRowProps = {
  product: WishlistProduct;
  onProductPress: (product: WishlistProduct) => void;
};

export const WishlistRow = ({ product, onProductPress }: WishlistRowProps) => {
  const styles = useWishlistRowStyles();
  const { removeItem } = useWishlist();
  const [removePressed, setRemovePressed] = useState(false);
  const heading = product.productName?.trim() || "—";
  const imageUrl = resolveProductImageUrl(product);

  const handleRemove = () => {
    removeItem(String(product._id));
  };

  return (
    <View style={styles.row}>
      <CachedProductImage uri={imageUrl} style={styles.image} />
      <View style={styles.info}>
        <Pressable
          style={styles.headingButton}
          onPress={() => onProductPress(product)}
          accessibilityRole="button"
        >
          <Text style={styles.heading} numberOfLines={1}>
            {heading}
          </Text>
        </Pressable>
        <Text style={styles.price}>{formatPriceRub(product.productPrice)}</Text>
      </View>
      <Pressable
        style={[styles.remove, removePressed && styles.removePressed]}
        onPress={handleRemove}
        onPressIn={() => setRemovePressed(true)}
        onPressOut={() => setRemovePressed(false)}
        accessibilityRole="button"
        accessibilityLabel={WISHLIST_PAGE_UI.REMOVE_ARIA(heading)}
      >
        <MaterialIcons
          name="close"
          size={20}
          style={[styles.removeIcon, removePressed && styles.removeIconPressed]}
        />
      </Pressable>
    </View>
  );
};
