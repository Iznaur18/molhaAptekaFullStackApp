import { Image } from "expo-image";
import { useState } from "react";
import { Pressable } from "react-native";

import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useCuratedCategoryCompactCardStyles } from "@/shared/theme/catalogProductStyles";
import type { HomeCuratedCategory } from "../api/fetchHomeCuratedCategoryLists";

type CuratedCategoryCompactCardProps = {
  category: HomeCuratedCategory;
  width: number;
  onOpen: (category: HomeCuratedCategory) => void;
};

export const CuratedCategoryCompactCard = ({
  category,
  width,
  onOpen,
}: CuratedCategoryCompactCardProps) => {
  const styles = useCuratedCategoryCompactCardStyles();
  const [failed, setFailed] = useState(false);
  const resolved = category.imageUrl ? resolveUploadedMediaUrl(category.imageUrl) : "";
  const imageUrl =
    failed || !resolved ? PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE : resolved;

  return (
    <Pressable
      style={[styles.card, { width }]}
      onPress={() => onOpen(category)}
      accessibilityRole="button"
      accessibilityLabel={category.label}
    >
      <Image
        source={{ uri: imageUrl }}
        style={[styles.imageWrap, styles.image]}
        contentFit="cover"
        onError={() => setFailed(true)}
      />
    </Pressable>
  );
};
