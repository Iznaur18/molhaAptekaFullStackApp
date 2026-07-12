import { memo } from "react";
import { Text, View } from "react-native";

import { CatalogBreadcrumb } from "@/features/catalog-filter/ui/CatalogBreadcrumb";
import { HomeFeedHeader } from "@/features/home-feed/ui/HomeFeedHeader";
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
};

export const HomeFeedListHeader = memo(
  ({
    showHomeFeed,
    showCuratedLists,
    catalogBreadcrumbLabel,
    isCatalogEmpty,
    emptyLabel,
    styles,
  }: HomeFeedListHeaderProps) => (
    <View style={styles.listHeader}>
      {showHomeFeed ? <HomeCatalogSiteHeaderBannerRow visible={showHomeFeed} /> : null}
      {!showHomeFeed && catalogBreadcrumbLabel ? (
        <CatalogBreadcrumb label={catalogBreadcrumbLabel} />
      ) : null}
      {showHomeFeed ? (
        <HomeFeedHeader enabled={showHomeFeed} showCuratedLists={showCuratedLists} />
      ) : null}
      {showHomeFeed ? (
        <CatalogBreadcrumb label={HOME_PAGE_UI.BREADCRUMB_HOME} compactTop />
      ) : null}
      {showHomeFeed && isCatalogEmpty ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>{emptyLabel}</Text>
        </View>
      ) : null}
    </View>
  ),
);

HomeFeedListHeader.displayName = "HomeFeedListHeader";
