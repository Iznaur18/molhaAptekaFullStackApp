import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeCatalogHeaderPanel } from "@/features/home-feed/ui/HomeCatalogHeaderPanel";
import { HomeCatalogHeaderSearch } from "@/features/home-feed/ui/HomeCatalogHeaderSearch";
import { HomeCatalogUsersButton } from "@/features/home-feed/ui/HomeCatalogUsersButton";
import {
  HOME_CATALOG_HEADER_PANEL_PADDING,
  resolveHomeCatalogHeaderPanelPaddingTop,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogSearchRowProps = {
  value: string;
  onChange: (value: string) => void;
  /** Safe-area уже учтён spacer'ом foreground-sheet. */
  embeddedInForegroundSheet?: boolean;
};

export const HomeCatalogSearchRow = ({
  value,
  onChange,
  embeddedInForegroundSheet = false,
}: HomeCatalogSearchRowProps) => {
  const insets = useSafeAreaInsets();
  const styles = useHomeCatalogHeaderStyles();
  const paddingTop = embeddedInForegroundSheet
    ? HOME_CATALOG_HEADER_PANEL_PADDING.top
    : resolveHomeCatalogHeaderPanelPaddingTop(insets.top);

  return (
    <HomeCatalogHeaderPanel paddingTop={paddingTop} flatSheet={embeddedInForegroundSheet}>
      <View style={styles.topRow}>
        <HomeCatalogHeaderSearch value={value} onChange={onChange} />
        <HomeCatalogUsersButton embeddedInForegroundSheet={embeddedInForegroundSheet} />
      </View>
    </HomeCatalogHeaderPanel>
  );
};
