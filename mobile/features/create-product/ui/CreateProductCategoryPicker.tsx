import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { buildCatalogSubcategoryPickerTiles } from "@/entities/product-category-display/lib/buildCatalogSubcategoryPickerTiles";
import {
  buildResolvedProductCategoryDisplaysFromRoots,
  PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE,
} from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { useProductCategoryDisplaysQuery } from "@/entities/product-category-display/model/useProductCategoryDisplaysQuery";
import { useProductCategoryChildrenQuery } from "@/entities/product-category-tree/model/useProductCategoryChildrenQuery";
import { useProductCategoryRootsQuery } from "@/entities/product-category-tree/model/useProductCategoryRootsQuery";
import {
  CATEGORY_SEARCH_MIN_QUERY_LENGTH,
  useProductCategorySearchQuery,
} from "@/entities/product-category-tree/model/useProductCategorySearchQuery";
import { useCatalogBrowserGridLayout } from "@/features/catalog-browser/lib/useCatalogBrowserGridLayout";
import { CatalogBrowserTileCard } from "@/features/catalog-browser/ui/CatalogBrowserTileCard";
import { CREATE_PRODUCT_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCategoryPickerSheetStyles } from "@/shared/theme/categoryPickerSheetStyles";

const SEARCH_DEBOUNCE_MS = 300;

type CategoryNode = {
  id: string;
  labelRu: string;
  isLeaf: boolean;
  slug?: string;
  legacyProductCategory?: string | null;
};

type TrailItem = {
  id: string;
  labelRu: string;
};

export type CreateProductCategoryPickerProps = {
  selectedCategoryId: string | null;
  selectedCategoryLabel: string;
  onSelect: (categoryId: string, label: string) => void;
};

const normalizeNode = (raw: Record<string, unknown>): CategoryNode => ({
  id: String(raw.id ?? raw._id ?? ""),
  labelRu: String(raw.labelRu ?? raw.name ?? ""),
  isLeaf: raw.isLeaf === true,
  slug: typeof raw.slug === "string" ? raw.slug : undefined,
  legacyProductCategory:
    typeof raw.legacyProductCategory === "string" ? raw.legacyProductCategory : null,
});

const buildFullPath = (pathLabelRu: string[], labelRu: string): string[] =>
  pathLabelRu[pathLabelRu.length - 1] === labelRu ? pathLabelRu : [...pathLabelRu, labelRu];

export const CreateProductCategoryPicker = ({
  selectedCategoryId,
  selectedCategoryLabel,
  onSelect,
}: CreateProductCategoryPickerProps) => {
  const theme = useAppTheme();
  const s = useCategoryPickerSheetStyles();
  const gridLayout = useCatalogBrowserGridLayout();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const isSearchMode = searchQuery.trim().length >= CATEGORY_SEARCH_MIN_QUERY_LENGTH;

  const isRoot = trail.length === 0;
  const activeParentId = isRoot ? null : trail[trail.length - 1].id;

  const rootsQuery = useProductCategoryRootsQuery(sheetOpen);
  const childrenQuery = useProductCategoryChildrenQuery(sheetOpen ? activeParentId : null);
  const displaysQuery = useProductCategoryDisplaysQuery();
  const searchResultsQuery = useProductCategorySearchQuery(sheetOpen ? searchQuery : "");

  const options = useMemo<CategoryNode[]>(() => {
    if (isRoot) {
      return (rootsQuery.data ?? []).map((n) =>
        normalizeNode(n as unknown as Record<string, unknown>),
      );
    }
    return ((childrenQuery.data as { categories?: unknown[] } | null)?.categories ?? []).map(
      (n) => normalizeNode(n as Record<string, unknown>),
    );
  }, [isRoot, rootsQuery.data, childrenQuery.data]);

  const displays = displaysQuery.data ?? [];

  const tiles = useMemo(() => {
    if (isRoot) {
      return buildResolvedProductCategoryDisplaysFromRoots(
        options.map((node) => ({
          id: node.id,
          slug: node.slug ?? node.id,
          labelRu: node.labelRu,
          legacyProductCategory: node.legacyProductCategory ?? null,
          isLeaf: node.isLeaf,
        })),
        displays,
      ).map((item) => ({
        key: item.categoryId ?? item.displaySlug,
        categoryId: item.categoryId ?? "",
        label: item.label,
        imageUrl: item.imageUrl,
      }));
    }

    const parent = trail[trail.length - 1];
    if (!parent) {
      return [];
    }

    return buildCatalogSubcategoryPickerTiles({
      parent,
      categories: options.map((node) => ({ id: node.id, labelRu: node.labelRu })),
      displays,
      includeViewAll: false,
    });
  }, [displays, isRoot, options, trail]);

  const tileLayoutProps = {
    tileWidth: gridLayout.tileWidth,
    columns: gridLayout.columns,
    gap: gridLayout.gap,
    contentWidth: gridLayout.contentWidth,
  };

  const isBrowseLoading = isRoot ? rootsQuery.isPending : childrenQuery.isPending;
  const browseError =
    (rootsQuery.error instanceof Error ? rootsQuery.error.message : "") ||
    (childrenQuery.error instanceof Error ? childrenQuery.error.message : "");
  const searchError =
    searchResultsQuery.error instanceof Error ? searchResultsQuery.error.message : "";

  const openSheet = () => {
    setTrail([]);
    setSearchInput("");
    setSearchQuery("");
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
  };

  const finishSelect = (categoryId: string, fullLabel: string) => {
    onSelect(categoryId, fullLabel);
    closeSheet();
  };

  const handleBrowsePick = (node: CategoryNode) => {
    if (node.isLeaf) {
      finishSelect(node.id, [...trail.map((t) => t.labelRu), node.labelRu].join(" › "));
      return;
    }
    setTrail((prev) => [...prev, { id: node.id, labelRu: node.labelRu }]);
  };

  const handleTilePress = (categoryId: string) => {
    const node = options.find((row) => row.id === categoryId);
    if (node) {
      handleBrowsePick(node);
    }
  };

  const handleCrumbPress = (index: number) => {
    setTrail((prev) => prev.slice(0, index + 1));
  };

  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>
        {CREATE_PRODUCT_UI.LABEL_CATEGORY}{" "}
        <Text style={{ color: theme.colors.danger }}>*</Text>
      </Text>

      <Pressable
        style={({ pressed }) => [s.fieldBox, pressed && s.fieldBoxPressed]}
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel={CREATE_PRODUCT_UI.LABEL_CATEGORY}
      >
        <Text
          style={[s.fieldValue, !selectedCategoryId && s.fieldPlaceholder]}
          numberOfLines={2}
        >
          {selectedCategoryId
            ? selectedCategoryLabel || CREATE_PRODUCT_UI.LABEL_CATEGORY
            : CREATE_PRODUCT_UI.CATEGORY_FIELD_PLACEHOLDER}
        </Text>
        <Text style={s.fieldChevron}>{selectedCategoryId ? "›" : "＋"}</Text>
      </Pressable>

      <Modal
        visible={sheetOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSheet}
      >
        <SafeAreaView edges={["top", "bottom"]} style={s.sheetRoot}>
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>{CREATE_PRODUCT_UI.CATEGORY_SHEET_TITLE}</Text>
            <Pressable onPress={closeSheet} hitSlop={8}>
              <Text style={s.sheetClose}>{CREATE_PRODUCT_UI.CATEGORY_SHEET_CLOSE}</Text>
            </Pressable>
          </View>

          <View style={s.searchWrap}>
            <TextInput
              style={s.searchInput}
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder={CREATE_PRODUCT_UI.CATEGORY_SEARCH_PLACEHOLDER}
              placeholderTextColor={theme.colors.textMuted}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          {isSearchMode ? (
            searchResultsQuery.isPending ? (
              <View style={s.statusWrap}>
                <ActivityIndicator size="small" color={theme.colors.textMuted} />
                <Text style={s.statusText}>{CREATE_PRODUCT_UI.CATEGORY_SEARCH_LOADING}</Text>
              </View>
            ) : searchError ? (
              <View style={s.statusWrap}>
                <Text style={s.errorText}>{searchError}</Text>
              </View>
            ) : (searchResultsQuery.data ?? []).length === 0 ? (
              <View style={s.statusWrap}>
                <Text style={s.statusText}>{CREATE_PRODUCT_UI.CATEGORY_SEARCH_EMPTY}</Text>
              </View>
            ) : (
              <ScrollView
                style={s.list}
                contentContainerStyle={s.listContent}
                keyboardShouldPersistTaps="handled"
              >
                {(searchResultsQuery.data ?? []).map((result, index, all) => {
                  const fullPath = buildFullPath(result.pathLabelRu, result.labelRu);
                  return (
                    <Pressable
                      key={result.id}
                      style={({ pressed }) => [
                        s.row,
                        index === 0 && s.rowFirst,
                        index === all.length - 1 && s.rowLast,
                        pressed && s.rowPressed,
                      ]}
                      onPress={() => finishSelect(result.id, fullPath.join(" › "))}
                    >
                      <View style={s.rowTextWrap}>
                        <Text style={s.rowLabel} numberOfLines={2}>
                          {result.labelRu}
                        </Text>
                        {fullPath.length > 1 ? (
                          <Text style={s.rowPath} numberOfLines={1}>
                            {fullPath.slice(0, -1).join(" › ")}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={s.rowLeafMark}>✓</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )
          ) : (
            <>
              <View style={s.crumbs}>
                <Pressable
                  style={[s.crumbChip, isRoot && s.crumbChipCurrent]}
                  onPress={() => handleCrumbPress(-1)}
                  disabled={isRoot}
                >
                  <Text style={[s.crumbText, isRoot && s.crumbTextCurrent]}>
                    {CREATE_PRODUCT_UI.CATEGORY_ROOT_CRUMB}
                  </Text>
                </Pressable>
                {trail.map((item, index) => {
                  const isCurrent = index === trail.length - 1;
                  return (
                    <Pressable
                      key={item.id}
                      style={[s.crumbChip, isCurrent && s.crumbChipCurrent]}
                      onPress={() => handleCrumbPress(index)}
                      disabled={isCurrent}
                    >
                      <Text style={[s.crumbText, isCurrent && s.crumbTextCurrent]}>
                        {item.labelRu}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {isBrowseLoading ? (
                <View style={s.statusWrap}>
                  <ActivityIndicator size="small" color={theme.colors.textMuted} />
                </View>
              ) : browseError ? (
                <View style={s.statusWrap}>
                  <Text style={s.errorText}>{browseError}</Text>
                </View>
              ) : options.length === 0 ? (
                <View style={s.statusWrap}>
                  <Text style={s.statusText}>
                    {isRoot
                      ? CREATE_PRODUCT_UI.CATEGORY_EMPTY_TREE
                      : CREATE_PRODUCT_UI.CATEGORY_EMPTY_LEVEL}
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={s.list}
                  contentContainerStyle={[s.listContent, s.tilesContent]}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={[s.tilesGrid, { gap: gridLayout.gap }]}>
                    {tiles.map((item) => (
                      <CatalogBrowserTileCard
                        key={item.key}
                        label={item.label}
                        imageUrl={item.imageUrl}
                        placeholderImageUrl={PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE}
                        {...tileLayoutProps}
                        onPress={() => handleTilePress(item.categoryId)}
                      />
                    ))}
                  </View>
                </ScrollView>
              )}
            </>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};
