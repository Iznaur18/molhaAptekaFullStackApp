import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useViewerRegion } from "@/entities/region/model/ViewerRegionProvider";
import { ViewerRegionSelect } from "@/entities/region/ui/ViewerRegionSelect";
import { HomeCatalogFiltersButton } from "@/features/home-feed/ui/HomeCatalogFiltersButton";
import { HomeCatalogHeaderPanel } from "@/features/home-feed/ui/HomeCatalogHeaderPanel";
import { HomeCatalogHeaderSearch } from "@/features/home-feed/ui/HomeCatalogHeaderSearch";
import { HomeCatalogUsersButton } from "@/features/home-feed/ui/HomeCatalogUsersButton";
import {
  HOME_CATALOG_HEADER_PANEL_FLOATING_PADDING,
  resolveHomeCatalogHeaderPanelPaddingTop,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogSearchRowProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  filtersOpen: boolean;
  filtersActive: boolean;
  onOpenFilters: () => void;
  /** Safe-area уже учтён spacer'ом foreground-sheet. */
  embeddedInForegroundSheet?: boolean;
};

export const HomeCatalogSearchRow = ({
  value,
  onChange,
  onSubmit,
  filtersOpen,
  filtersActive,
  onOpenFilters,
  embeddedInForegroundSheet = false,
}: HomeCatalogSearchRowProps) => {
  const insets = useSafeAreaInsets();
  const styles = useHomeCatalogHeaderStyles();
  const { viewerRegionCode, setViewerRegionCode } = useViewerRegion();
  const paddingTop = embeddedInForegroundSheet
    ? HOME_CATALOG_HEADER_PANEL_FLOATING_PADDING.top
    : resolveHomeCatalogHeaderPanelPaddingTop(insets.top);

  return (
    <HomeCatalogHeaderPanel
      paddingTop={paddingTop}
      flatSheet={false}
      floating={embeddedInForegroundSheet}
    >
      <View style={styles.topRow}>
        <HomeCatalogHeaderSearch
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
        />
        <View style={styles.authActions}>
          <HomeCatalogFiltersButton
            expanded={filtersOpen}
            active={filtersActive}
            onPress={onOpenFilters}
          />
          <ViewerRegionSelect value={viewerRegionCode} onChange={setViewerRegionCode} />
          <HomeCatalogUsersButton
            embeddedInForegroundSheet={embeddedInForegroundSheet}
          />
        </View>
      </View>
    </HomeCatalogHeaderPanel>
  );
};
