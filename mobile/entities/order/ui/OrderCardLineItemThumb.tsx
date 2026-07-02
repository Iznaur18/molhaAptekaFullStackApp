import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { isOrderLineItemProductClickable } from "@/entities/order/lib/isOrderLineItemProductClickable";
import { resolveOrderLineItemProductImageUrl } from "@/entities/order/lib/resolveOrderLineItemProductImageUrl";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "@/entities/product/model/constants";
import { useOrderCardStyles } from "@/shared/theme/commerceScreenStyles";

type OrderCardLineItemThumbProps = {
  item: unknown;
  productName: string;
  onProductClick?: (item: unknown) => void;
};

export const OrderCardLineItemThumb = ({
  item,
  productName,
  onProductClick,
}: OrderCardLineItemThumbProps) => {
  const styles = useOrderCardStyles();
  const [failed, setFailed] = useState(false);
  const src = failed
    ? PRODUCT_IMAGE_PLACEHOLDER_URL
    : resolveOrderLineItemProductImageUrl(item);
  const isClickable =
    Boolean(onProductClick) && isOrderLineItemProductClickable(item);

  const image = (
    <Image
      source={{ uri: src }}
      style={styles.itemThumbImage}
      contentFit="cover"
      accessibilityIgnoresInvertColors
      onError={() => setFailed(true)}
    />
  );

  if (isClickable) {
    return (
      <Pressable
        style={styles.itemThumbPressable}
        accessibilityRole="button"
        accessibilityLabel={productName}
        onPress={() => onProductClick?.(item)}
      >
        {image}
      </Pressable>
    );
  }

  return <View style={styles.itemThumb}>{image}</View>;
};
