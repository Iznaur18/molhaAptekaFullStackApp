import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CatalogSearchBar } from "@/features/catalog-filter/ui/CatalogSearchBar";
import { HomeCatalogBrandLogo } from "@/features/home-feed/ui/HomeCatalogBrandLogo";
import { HomeCatalogUsersButton } from "@/features/home-feed/ui/HomeCatalogUsersButton";
import { resolveScreenContentPaddingHorizontal } from "@/shared/theme/screenContentLayout";
import { useHomeCatalogSearchRowStyles } from "@/shared/theme/catalogProductStyles";

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
  const styles = useHomeCatalogSearchRowStyles();
  const paddingHorizontal = resolveScreenContentPaddingHorizontal(insets);

  return (
    <View
      style={[
        styles.root,
        { paddingTop: Math.max(insets.top, 8), paddingHorizontal },
      ]}
    >
      <HomeCatalogBrandLogo onPress={onBrandPress} />
      <View style={styles.searchSlot}>
        <CatalogSearchBar value={value} onChange={onChange} embedded />
      </View>
      <HomeCatalogUsersButton />
    </View>
  );
};
