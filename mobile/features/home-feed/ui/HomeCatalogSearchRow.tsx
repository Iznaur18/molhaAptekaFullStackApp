import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeCatalogFiltersButton } from "@/features/home-feed/ui/HomeCatalogFiltersButton";
import { HomeCatalogHeaderPanel } from "@/features/home-feed/ui/HomeCatalogHeaderPanel";
import { HomeCatalogHeaderSearch } from "@/features/home-feed/ui/HomeCatalogHeaderSearch";
import { HomeCatalogUsersButton } from "@/features/home-feed/ui/HomeCatalogUsersButton";
import { resolveHomeCatalogHeaderPanelPaddingTop } from "@/shared/lib/homeCatalogHeaderLayout";
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
  // Embedded: top уже в `homeFeedScrollTopInset` (safe-area + 8), как web
  // `padding-top: fixed-top + 2.75rem + space-2` — без второго paddingTop на панели.
  const paddingTop = embeddedInForegroundSheet
    ? 0
    : resolveHomeCatalogHeaderPanelPaddingTop(insets.top);
  const inlinePadding = resolveScreenContentInlinePadding(width);

  return (
    <HomeCatalogHeaderPanel
      paddingTop={paddingTop}
      flatSheet={embeddedInForegroundSheet}
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
