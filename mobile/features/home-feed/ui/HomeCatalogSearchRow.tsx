import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeCatalogBrandLogo } from "@/features/home-feed/ui/HomeCatalogBrandLogo";
import {
  HomeCatalogHeaderPanel,
} from "@/features/home-feed/ui/HomeCatalogHeaderPanel";
import { HomeCatalogHeaderSearch } from "@/features/home-feed/ui/HomeCatalogHeaderSearch";
import { HomeCatalogUsersButton } from "@/features/home-feed/ui/HomeCatalogUsersButton";
import {
  resolveHomeCatalogHeaderPanelPaddingTop,
  resolveHomeCatalogHeaderShellInset,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogSearchRowProps = {
  value: string;
  onChange: (value: string) => void;
  onBrandPress?: () => void;
};

export const HomeCatalogSearchRow = ({
  value,
  onChange,
  onBrandPress,
}: HomeCatalogSearchRowProps) => {
  const insets = useSafeAreaInsets();
  const styles = useHomeCatalogHeaderStyles();
  const marginHorizontal = resolveHomeCatalogHeaderShellInset(insets);
  const panelPaddingTop = resolveHomeCatalogHeaderPanelPaddingTop(insets.top);

  return (
    <HomeCatalogHeaderPanel
      paddingTop={panelPaddingTop}
      style={{ marginHorizontal }}
    >
      <View style={styles.topRow}>
        <HomeCatalogBrandLogo onPress={onBrandPress} />
        <HomeCatalogHeaderSearch value={value} onChange={onChange} />
        <HomeCatalogUsersButton />
      </View>
    </HomeCatalogHeaderPanel>
  );
};
