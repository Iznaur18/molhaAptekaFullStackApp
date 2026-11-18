import { ActivityIndicator, Text } from "react-native";

import type { HomeCuratedCategory } from "@/entities/curated-category-list/api/fetchHomeCuratedCategoryLists";
import { useHomeCuratedCategoryListsQuery } from "@/entities/curated-category-list/model/useHomeCuratedCategoryListsQuery";
import { useViewerRegion } from "@/entities/region/model/ViewerRegionProvider";
import { HomeCuratedCategoryListsSection } from "@/features/home-feed/ui/HomeCuratedCategoryListsSection";
import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useHomeFeedSectionTabStyles } from "@/shared/theme/homeFeedSectionTabStyles";

type HomeFeedCategoriesPanelProps = {
  onOpenCategory: (category: HomeCuratedCategory) => void;
};

export const HomeFeedCategoriesPanel = ({
  onOpenCategory,
}: HomeFeedCategoriesPanelProps) => {
  const styles = useHomeFeedSectionTabStyles();
  const theme = useAppTheme();
  const { viewerRegionCode } = useViewerRegion();
  const listsQuery = useHomeCuratedCategoryListsQuery({
    regionCode: viewerRegionCode,
  });
  const lists = listsQuery.data ?? [];

  if (listsQuery.isPending) {
    return <ActivityIndicator color={theme.colors.action} />;
  }

  if (listsQuery.isError) {
    return (
      <Text style={styles.error}>
        {formatApiErrorMessage(
          listsQuery.error,
          HOME_PAGE_UI.CATALOG_HOME_SECTION_LOAD_ERROR,
        )}
      </Text>
    );
  }

  if (lists.length === 0) {
    return (
      <Text style={styles.empty}>
        {HOME_PAGE_UI.CATALOG_HOME_SECTION_CATEGORIES_EMPTY}
      </Text>
    );
  }

  return (
    <HomeCuratedCategoryListsSection lists={lists} onOpenCategory={onOpenCategory} />
  );
};
