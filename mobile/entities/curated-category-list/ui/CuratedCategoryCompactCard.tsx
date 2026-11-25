import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useCuratedCategoryCompactCardStyles } from "@/shared/theme/catalogProductStyles";
import type { HomeCuratedCategory } from "../api/fetchHomeCuratedCategoryLists";
import { CURATED_CATEGORY_LIST_SHEET_IMAGE_ASPECT } from "../lib/curatedCategoryListHomeLayout";

type CuratedCategoryCompactCardProps = {
  category: HomeCuratedCategory;
  width: number;
  onOpen: (category: HomeCuratedCategory) => void;
  /** Web: карусель 4/3, sheet/default 2/1. */
  imageAspectRatio?: number;
};

export const CuratedCategoryCompactCard = ({
  category,
  width,
  onOpen,
  imageAspectRatio = CURATED_CATEGORY_LIST_SHEET_IMAGE_ASPECT,
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
      <View style={[styles.imageWrap, { aspectRatio: imageAspectRatio }]}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          onError={() => setFailed(true)}
        />
      </View>
    </Pressable>
  );
};
