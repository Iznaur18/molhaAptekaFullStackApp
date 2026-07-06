import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeCatalogHeaderPanel } from "@/features/home-feed/ui/HomeCatalogHeaderPanel";
import { HomeCatalogHeaderSearch } from "@/features/home-feed/ui/HomeCatalogHeaderSearch";
import { HomeCatalogUsersButton } from "@/features/home-feed/ui/HomeCatalogUsersButton";
import { resolveHomeCatalogHeaderPanelPaddingTop } from "@/shared/lib/homeCatalogHeaderLayout";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogSearchRowProps = {
  value: string;
  onChange: (value: string) => void;
};

export const HomeCatalogSearchRow = ({ value, onChange }: HomeCatalogSearchRowProps) => {
  const insets = useSafeAreaInsets();
  const styles = useHomeCatalogHeaderStyles();
  const paddingTop = resolveHomeCatalogHeaderPanelPaddingTop(insets.top);

  return (
    <HomeCatalogHeaderPanel paddingTop={paddingTop}>
      <View style={styles.topRow}>
        <HomeCatalogHeaderSearch value={value} onChange={onChange} />
        <HomeCatalogUsersButton />
      </View>
    </HomeCatalogHeaderPanel>
  );
};
