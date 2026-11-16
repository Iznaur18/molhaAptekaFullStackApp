import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeCatalogFiltersButton } from "@/features/home-feed/ui/HomeCatalogFiltersButton";
import { HomeCatalogHeaderPanel } from "@/features/home-feed/ui/HomeCatalogHeaderPanel";
import { HomeCatalogHeaderSearch } from "@/features/home-feed/ui/HomeCatalogHeaderSearch";
import { HomeCatalogUsersButton } from "@/features/home-feed/ui/HomeCatalogUsersButton";
import {
  HOME_CATALOG_HEADER_PANEL_FLOATING_PADDING,
  resolveHomeCatalogHeaderPanelPaddingTop,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { resolveScreenContentInlinePadding } from "@/shared/lib/screenBreakpoints";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
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
  const { width } = useScreenLayout();
  const styles = useHomeCatalogHeaderStyles();
  const paddingTop = embeddedInForegroundSheet
    ? HOME_CATALOG_HEADER_PANEL_FLOATING_PADDING.top
    : resolveHomeCatalogHeaderPanelPaddingTop(insets.top);
  const inlinePadding = resolveScreenContentInlinePadding(width);

  return (
    <HomeCatalogHeaderPanel
      paddingTop={paddingTop}
      style={{
        paddingHorizontal: embeddedInForegroundSheet ? 0 : inlinePadding,
      }}
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
          <HomeCatalogUsersButton
            embeddedInForegroundSheet={embeddedInForegroundSheet}
          />
        </View>
      </View>
    </HomeCatalogHeaderPanel>
  );
};
