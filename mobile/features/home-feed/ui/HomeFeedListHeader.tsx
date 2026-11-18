import { memo } from "react";
import { Text, View } from "react-native";

import type { HomeCuratedCategory } from "@/entities/curated-category-list/api/fetchHomeCuratedCategoryLists";
import { CatalogBreadcrumb } from "@/features/catalog-filter/ui/CatalogBreadcrumb";
import type { HomeFeedSectionTab } from "@/features/home-feed/model/homeFeedSectionTab";
import { HomeFeedCategoriesPanel } from "@/features/home-feed/ui/HomeFeedCategoriesPanel";
import { HomeFeedHeader } from "@/features/home-feed/ui/HomeFeedHeader";
import { HomeFeedSectionTabs } from "@/features/home-feed/ui/HomeFeedSectionTabs";
import { HomeFeedSellersSection } from "@/features/home-feed/ui/HomeFeedSellersSection";
import { HomeCatalogSiteHeaderBannerRow } from "@/features/home-feed/ui/HomeCatalogSiteHeaderBannerRow";
import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import type { useFeedScreenStyles } from "@/shared/theme/catalogProductStyles";

type HomeFeedListHeaderStyles = ReturnType<typeof useFeedScreenStyles>;

type HomeFeedListHeaderProps = {
  showHomeFeed: boolean;
  showCuratedLists: boolean;
  catalogBreadcrumbLabel: string | null;
  isCatalogEmpty: boolean;
  emptyLabel: string;
  styles: HomeFeedListHeaderStyles;
  sectionTab: HomeFeedSectionTab;
  onSectionTabChange: (tab: HomeFeedSectionTab) => void;
  sellerSearch: string;
  onSellerSearchChange: (next: string) => void;
  onOpenCuratedCategory: (category: HomeCuratedCategory) => void;
};

export const HomeFeedListHeader = memo(
  ({
    showHomeFeed,
    showCuratedLists,
    catalogBreadcrumbLabel,
    isCatalogEmpty,
    emptyLabel,
    styles,
    sectionTab,
    onSectionTabChange,
    sellerSearch,
    onSellerSearchChange,
    onOpenCuratedCategory,
  }: HomeFeedListHeaderProps) => {
    const showSectionTabs = showHomeFeed && showCuratedLists;
    const activeTab: HomeFeedSectionTab = showSectionTabs ? sectionTab : "home";

    return (
      <View style={styles.listHeader}>
        {showHomeFeed ? (
          <HomeCatalogSiteHeaderBannerRow visible={showHomeFeed} />
        ) : null}
        {!showHomeFeed && catalogBreadcrumbLabel ? (
          <CatalogBreadcrumb label={catalogBreadcrumbLabel} />
        ) : null}
        {showHomeFeed ? (
          <HomeFeedHeader enabled={showHomeFeed} showCuratedLists={showCuratedLists} />
        ) : null}
        {showSectionTabs ? (
          <>
            <HomeFeedSectionTabs active={activeTab} onChange={onSectionTabChange} />
            {activeTab === "sellers" ? (
              <HomeFeedSellersSection
                searchTerm={sellerSearch}
                onSearchChange={onSellerSearchChange}
              />
            ) : null}
            {activeTab === "categories" ? (
              <HomeFeedCategoriesPanel onOpenCategory={onOpenCuratedCategory} />
            ) : null}
          </>
        ) : showHomeFeed ? (
          <CatalogBreadcrumb label={HOME_PAGE_UI.BREADCRUMB_HOME} compactTop />
        ) : null}
        {showHomeFeed && activeTab === "home" && isCatalogEmpty ? (
          <View style={styles.centered}>
            <Text style={styles.empty}>{emptyLabel}</Text>
          </View>
        ) : null}
      </View>
    );
  },
);

HomeFeedListHeader.displayName = "HomeFeedListHeader";
