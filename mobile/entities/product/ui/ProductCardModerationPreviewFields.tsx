import { Text, View } from "react-native";

import { formatProductFieldForDisplay } from "@/entities/product/lib/formatProductFieldForDisplay";
import {
  getProductFieldLabel,
  PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS_WITHOUT_PRICE,
} from "@/entities/product/lib/productFieldRegistry";
import { ProductCardSellerRow } from "@/entities/product/ui/ProductCardSellerRow";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductCardStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardModerationPreviewFieldsProps = {
  product: Record<string, unknown>;
};

export const ProductCardModerationPreviewFields = ({
  product,
}: ProductCardModerationPreviewFieldsProps) => {
  const styles = useProductCardStyles();

  return (
    <View
      style={styles.moderationPreviewFields}
      accessibilityLabel={PRODUCT_CARD_UI.PREVIEW_FIELDS_ARIA}
    >
      {PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS_WITHOUT_PRICE.map((key) => {
        if (key === "productSeller") {
          return (
            <View key={key} style={styles.moderationPreviewSellerRow}>
              <ProductCardSellerRow product={product} />
            </View>
          );
        }

        const display = formatProductFieldForDisplay(key, product);
        const isDescription = key === "productDescription";

        return (
          <View key={key} style={styles.moderationPreviewRow}>
            <Text style={styles.moderationPreviewKey}>{getProductFieldLabel(key)}</Text>
            <Text
              style={[
                styles.moderationPreviewValue,
                isDescription && styles.moderationPreviewValueMultiline,
              ]}
            >
              {display}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
