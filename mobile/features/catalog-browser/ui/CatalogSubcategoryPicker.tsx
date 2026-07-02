import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { buildCatalogSubcategoryPickerTiles } from "@/entities/product-category-display/lib/buildCatalogSubcategoryPickerTiles";
import type { ProductCategoryDisplayFromApi } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { useProductCategoryChildrenQuery } from "@/entities/product-category-tree/model/useProductCategoryChildrenQuery";
import type { CatalogSubcategoryPickerTrailStep } from "@/features/catalog-browser/model/useCatalogSubcategoryPicker";
import { useCatalogBrowserGridLayout } from "@/features/catalog-browser/lib/useCatalogBrowserGridLayout";
import { CatalogBrowserTileCard } from "@/features/catalog-browser/ui/CatalogBrowserTileCard";
import { API_CLIENT_UI, PRODUCT_CATEGORY_DISPLAY_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useCatalogSubcategoryPickerStyles } from "@/shared/theme/catalogProductStyles";

type CatalogSubcategoryPickerProps = {
  trail: CatalogSubcategoryPickerTrailStep[];
  displays: ProductCategoryDisplayFromApi[];
  loadError: string | null;
  resolvingCategoryId: string | null;
  onBack: () => void;
  onViewAll: (categoryId: string) => void;
  onCategoryClick: (node: { id: string; labelRu: string }) => void;
};

export const CatalogSubcategoryPicker = ({
  trail,
  displays,
  loadError,
  resolvingCategoryId,
  onBack,
  onViewAll,
  onCategoryClick,
}: CatalogSubcategoryPickerProps) => {
  const styles = useCatalogSubcategoryPickerStyles();
  const gridLayout = useCatalogBrowserGridLayout();
  const { contentPaddingTop } = useScreenLayout();
  const activeParent = trail[trail.length - 1];

  const childrenQuery = useProductCategoryChildrenQuery(activeParent?.id ?? null);

  const queryErrorMessage =
    childrenQuery.error instanceof Error
      ? childrenQuery.error.message
      : childrenQuery.isError
        ? API_CLIENT_UI.FETCH_CATEGORY_CHILDREN_FALLBACK
        : "";
  const errorMessage = loadError ?? queryErrorMessage;

  const categories = useMemo(() => {
    const rows = childrenQuery.data?.categories ?? [];
    return rows.flatMap((node) => {
      const id = node.id ?? node._id;
      if (id == null) {
        return [];
      }
      const labelRu = String(node.labelRu ?? node.name ?? "").trim() || String(id);
      return [{ id: String(id), labelRu }];
    });
  }, [childrenQuery.data?.categories]);

  const tiles = useMemo(() => {
    if (!activeParent) {
      return [];
    }

    return buildCatalogSubcategoryPickerTiles({
      parent: activeParent,
      categories,
      displays,
    });
  }, [activeParent, categories, displays]);

  const tileLayoutProps = {
    tileWidth: gridLayout.tileWidth,
    columns: gridLayout.columns,
    gap: gridLayout.gap,
    contentWidth: gridLayout.contentWidth,
  };

  const handleTilePress = (item: (typeof tiles)[number]) => {
    if (resolvingCategoryId) {
      return;
    }

    if (item.key.startsWith("view-all:")) {
      onViewAll(item.categoryId);
      return;
    }

    const node = categories.find((row) => row.id === item.categoryId);
    if (node) {
      onCategoryClick(node);
    }
  };

  if (!activeParent) {
    return null;
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: contentPaddingTop + 16 }]}
      accessibilityLabel={PRODUCT_CATEGORY_DISPLAY_UI.SUBCATEGORY_PICKER_ARIA}
    >
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_CATEGORY_DISPLAY_UI.SUBCATEGORY_BACK_ARIA}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>{PRODUCT_CATEGORY_DISPLAY_UI.SUBCATEGORY_BACK}</Text>
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">
          {activeParent.labelRu}
        </Text>
      </View>

      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}

      {childrenQuery.isPending ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>{PRODUCT_CATEGORY_DISPLAY_UI.LOADING}</Text>
        </View>
      ) : (
        <View style={[styles.grid, { gap: gridLayout.gap }]}>
          {tiles.map((item) => (
            <CatalogBrowserTileCard
              key={item.key}
              label={item.label}
              imageUrl={item.imageUrl}
              placeholderImageUrl={PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE}
              {...tileLayoutProps}
              disabled={resolvingCategoryId != null}
              pending={resolvingCategoryId === item.categoryId}
              onPress={() => handleTilePress(item)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};
