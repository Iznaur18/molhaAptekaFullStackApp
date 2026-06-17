import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { resolveProductCatalogPriceRub } from "@/entities/product/lib/resolveProductCatalogPriceRub";
import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";
import { CURATED_PRODUCT_COMPACT_CARD_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useCuratedProductCompactCardStyles } from "@/shared/theme/catalogProductStyles";

type CuratedProductCompactCardProps = {
  product: Record<string, unknown> & {
    _id: string;
    productName?: string;
    productPrice?: unknown;
  };
  width: number;
};

export const CuratedProductCompactCard = ({ product, width }: CuratedProductCompactCardProps) => {
  const router = useRouter();
  const styles = useCuratedProductCompactCardStyles();
  const imageUrls = resolveProductImageUrls(product);
  const imageUrl = imageUrls[0] ?? "";
  const priceLabel = formatPriceRub(resolveProductCatalogPriceRub(product));
  const productName = String(product.productName ?? "").trim();

  const handleOpen = () => {
    router.push(`/product/${product._id}` as never);
  };

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <Text style={styles.imageFallback}>{CURATED_PRODUCT_COMPACT_CARD_UI.NO_IMAGE}</Text>
        )}
      </View>
      <Pressable
        style={styles.priceWrap}
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={CURATED_PRODUCT_COMPACT_CARD_UI.OPEN_ARIA(productName)}
      >
        <Text style={styles.price} numberOfLines={1}>
          {priceLabel}
        </Text>
      </Pressable>
    </View>
  );
};
