import { Image } from "expo-image";
import { Pressable } from "react-native";

import { HOME_CATALOG_BRAND_LOGO } from "@/features/home-feed/lib/homeCatalogBrandLogoAsset";
import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { useHomeCatalogSearchRowStyles } from "@/shared/theme/catalogProductStyles";

type HomeCatalogBrandLogoProps = {
  onPress?: () => void;
};

export const HomeCatalogBrandLogo = ({ onPress }: HomeCatalogBrandLogoProps) => {
  const styles = useHomeCatalogSearchRowStyles();

  return (
    <Pressable
      style={styles.logoButton}
      accessibilityRole="button"
      accessibilityLabel={HOME_PAGE_UI.NAV_TO_HOME}
      onPress={onPress}
    >
      <Image
        source={HOME_CATALOG_BRAND_LOGO}
        style={styles.logoImage}
        contentFit="contain"
        accessibilityLabel={HOME_PAGE_UI.LOGO_ALT}
      />
    </Pressable>
  );
};
