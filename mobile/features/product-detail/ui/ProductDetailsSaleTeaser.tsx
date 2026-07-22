import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { isProductOnSale } from "@/entities/product/lib/isProductOnSale";
import { PRODUCT_SALE_UI } from "@/shared/config";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailsSaleTeaserProps = {
  product: Record<string, unknown>;
  sellerId: string;
};

export const ProductDetailsSaleTeaser = ({
  product,
  sellerId,
}: ProductDetailsSaleTeaserProps) => {
  const styles = useProductDetailScreenStyles();
  const router = useRouter();
  const trimmedSellerId = sellerId.trim();

  if (!isProductOnSale(product) || trimmedSellerId.length === 0) {
    return null;
  }

  const remainingCount = getProductPurchaseLimit(product);

  const handlePress = () => {
    router.push({ pathname: "/seller/[userId]", params: { userId: trimmedSellerId } });
  };

  return (
    <Pressable
      style={styles.installmentTeaser}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_SALE_UI.DETAILS_TEASER_ARIA}
    >
      <View style={styles.installmentTeaserCopy}>
        <Text style={styles.installmentTeaserTitle}>{PRODUCT_SALE_UI.DETAILS_TEASER_TITLE}</Text>
        <Text style={styles.installmentTeaserMonthly}>
          {PRODUCT_SALE_UI.DETAILS_TEASER_REMAINING(remainingCount)}
        </Text>
      </View>
      <View style={styles.installmentTeaserGo}>
        <Text style={styles.installmentTeaserGoText}>{PRODUCT_SALE_UI.DETAILS_TEASER_GO}</Text>
      </View>
    </Pressable>
  );
};
