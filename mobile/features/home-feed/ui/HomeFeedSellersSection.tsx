import { filterSellerStoreTilesBySearch } from "@izibuy/shared-lib";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { useViewerRegion } from "@/entities/region/model/ViewerRegionProvider";
import { useSellerPersonalCategoryCatalogTilesQuery } from "@/entities/seller-personal-category/model/useSellerPersonalCategoryCatalogTilesQuery";
import { useCatalogBrowserGridLayout } from "@/features/catalog-browser/lib/useCatalogBrowserGridLayout";
import { CatalogBrowserTileCard } from "@/features/catalog-browser/ui/CatalogBrowserTileCard";
import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useHomeFeedSectionTabStyles } from "@/shared/theme/homeFeedSectionTabStyles";

type HomeFeedSellersSectionProps = {
  searchTerm: string;
  onSearchChange: (next: string) => void;
};

export const HomeFeedSellersSection = ({
  searchTerm,
  onSearchChange,
}: HomeFeedSellersSectionProps) => {
  const styles = useHomeFeedSectionTabStyles();
  const theme = useAppTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();
  const { viewerRegionCode } = useViewerRegion();
  const grid = useCatalogBrowserGridLayout();
  const tilesQuery = useSellerPersonalCategoryCatalogTilesQuery({
    regionCode: viewerRegionCode,
  });
  const tiles = tilesQuery.data ?? [];
  const filteredTiles = useMemo(
    () => filterSellerStoreTilesBySearch(tiles, searchTerm),
    [searchTerm, tiles],
  );

  const openSeller = (sellerId: string) => {
    const id = sellerId.trim();
    if (!id) {
      return;
    }
    router.push(`/seller/${id}`);
  };

  if (tilesQuery.isPending) {
    return <ActivityIndicator color={theme.colors.action} />;
  }

  if (tilesQuery.isError) {
    return (
      <Text style={styles.error}>
        {formatApiErrorMessage(
          tilesQuery.error,
          HOME_PAGE_UI.CATALOG_HOME_SECTION_LOAD_ERROR,
        )}
      </Text>
    );
  }

  if (tiles.length === 0) {
    return (
      <Text style={styles.empty}>
        {HOME_PAGE_UI.CATALOG_HOME_SECTION_SELLERS_EMPTY}
      </Text>
    );
  }

  return (
    <View style={styles.sellers}>
      <TextInput
        style={[styles.searchInput, searchFocused && styles.searchInputFocused]}
        value={searchTerm}
        onChangeText={onSearchChange}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        placeholder={HOME_PAGE_UI.CATALOG_HOME_SECTION_SELLERS_SEARCH_PLACEHOLDER}
        placeholderTextColor={theme.colors.textMuted}
        accessibilityLabel={HOME_PAGE_UI.CATALOG_HOME_SECTION_SELLERS_SEARCH_ARIA}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {filteredTiles.length > 0 ? (
        <View
          style={[styles.grid, { gap: grid.gap }]}
          accessibilityLabel={HOME_PAGE_UI.CATALOG_HOME_SECTION_SELLERS}
        >
          {filteredTiles.map((tile) => (
            <CatalogBrowserTileCard
              key={tile._id}
              label={tile.labelRu}
              imageUrl={tile.imageUrl}
              placeholderImageUrl={PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE}
              tileWidth={grid.tileWidth}
              columns={grid.columns}
              gap={grid.gap}
              contentWidth={grid.contentWidth}
              onPress={() => openSeller(tile.sellerId)}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>
          {HOME_PAGE_UI.CATALOG_HOME_SECTION_SELLERS_SEARCH_EMPTY}
        </Text>
      )}
    </View>
  );
};
