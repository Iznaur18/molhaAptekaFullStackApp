import { useMemo } from "react";
import { View } from "react-native";

import { openProductInstagramPost } from "@/entities/product/lib/openProductInstagramPost";
import { resolveProductInstagramPost } from "@/entities/product/lib/resolveProductInstagramPost";
import { ProductInstagramPostMediaButton } from "@/entities/product/ui/ProductInstagramPostMediaButton";
import { useProductInstagramPostMediaOverlayStyles } from "@/shared/theme/catalogProductStyles";

type ProductInstagramPostMediaOverlayProps = {
  product: Record<string, unknown>;
  size?: "card" | "detail";
  withGalleryDots?: boolean;
};

export const ProductInstagramPostMediaOverlay = ({
  product,
  size = "card",
  withGalleryDots = false,
}: ProductInstagramPostMediaOverlayProps) => {
  const styles = useProductInstagramPostMediaOverlayStyles();
  const instagramPost = useMemo(() => resolveProductInstagramPost(product), [product]);

  if (!instagramPost) {
    return null;
  }

  return (
    <View
      style={[
        styles.slot,
        size === "detail" ? styles.slotDetail : null,
        withGalleryDots ? styles.slotWithDots : null,
      ]}
      pointerEvents="box-none"
    >
      <ProductInstagramPostMediaButton
        size={size}
        onPress={() => {
          void openProductInstagramPost(instagramPost.postUrl);
        }}
      />
    </View>
  );
};
