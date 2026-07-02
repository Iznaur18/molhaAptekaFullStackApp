import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { formatProductFieldForDisplay } from "@/entities/product/lib/formatProductFieldForDisplay";
import {
  hasProductCatalogDiscount,
  resolveProductDiscountPercent,
} from "@/entities/product/lib/computeProductDiscountPercent";
import { ProductCompactCardMediaThumb } from "@/entities/product/ui/ProductCompactCardMediaThumb";
import { ProductCardSellerRow } from "@/entities/product/ui/ProductCardSellerRow";
import {
  ProductModerationDetailsFooter,
  type ProductModerationActions,
} from "@/entities/product/ui/ProductModerationDetailsFooter";
import { ProductPriceDisplay } from "@/entities/product/ui/ProductPriceDisplay";
import { PRODUCT_MODERATION_PAGE_UI, PRODUCT_UI } from "@/shared/config";
import { useProductCompactCardStyles } from "@/shared/theme/productCompactCardStyles";

type ProductModerationQueueCardProps = {
  product: Record<string, unknown> & {
    _id: string;
    productName?: string;
  };
  moderationActions: ProductModerationActions;
};

export const ProductModerationQueueCard = ({
  product,
  moderationActions,
}: ProductModerationQueueCardProps) => {
  const router = useRouter();
  const styles = useProductCompactCardStyles();
  const name = product.productName?.trim() || "Без названия";
  const description = formatProductFieldForDisplay("productDescription", product);
  const createdAt = formatProductFieldForDisplay("createdAt", product);
  const hasDescription = description !== "—";
  const hasDiscount = hasProductCatalogDiscount(product);
  const discountPercent = resolveProductDiscountPercent(product);
  const openProductLabel = PRODUCT_UI.OPEN_ARIA(name);

  const openProduct = () => {
    router.push({ pathname: "/product/[id]", params: { id: product._id } });
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <ProductCompactCardMediaThumb
          product={product}
          onPress={openProduct}
          accessibilityLabel={openProductLabel}
        />

        <View style={styles.summary}>
          <View style={styles.statusRow}>
            <View style={[styles.statusPill, styles.statusPillPending]}>
              <Text style={styles.statusPillText}>{PRODUCT_MODERATION_PAGE_UI.BADGE_PENDING}</Text>
            </View>
          </View>

          <Pressable
            onPress={openProduct}
            accessibilityRole="button"
            accessibilityLabel={openProductLabel}
          >
            <Text style={styles.title} numberOfLines={2}>
              {name}
            </Text>
          </Pressable>

          <View style={styles.priceRow}>
            <ProductPriceDisplay product={product} showLabel={false} variant="inline" />
            {hasDiscount && discountPercent != null ? (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>-{discountPercent}%</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <ProductCardSellerRow product={product} />
            {createdAt !== "—" ? (
              <>
                <Text style={styles.metaMuted}>·</Text>
                <Text style={styles.metaMuted}>{createdAt}</Text>
              </>
            ) : null}
          </View>
        </View>
      </View>

      {hasDescription ? (
        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>
      ) : null}

      <View style={styles.divider} />

      <ProductModerationDetailsFooter {...moderationActions} variant="compact" />
    </View>
  );
};
