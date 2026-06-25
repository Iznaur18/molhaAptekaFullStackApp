import { Image } from "expo-image";
import { useCallback, useMemo, useState } from "react";
import { Pressable, useWindowDimensions } from "react-native";

import { HOME_CATALOG_BRAND_LOGO } from "@/features/home-feed/lib/homeCatalogBrandLogoAsset";
import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import {
  HOME_CATALOG_HEADER_LOGO_HEIGHT,
  resolveHomeCatalogHeaderLogoMaxWidth,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

/** Web JSX width={120} height={40} — fallback до onLoad. */
const LOGO_FALLBACK_ASPECT_RATIO = 120 / 40;

type HomeCatalogBrandLogoProps = {
  onPress?: () => void;
};

export const HomeCatalogBrandLogo = ({ onPress }: HomeCatalogBrandLogoProps) => {
  const styles = useHomeCatalogHeaderStyles();
  const { width: screenWidth } = useWindowDimensions();
  const [aspectRatio, setAspectRatio] = useState(LOGO_FALLBACK_ASPECT_RATIO);

  const logoMaxWidth = useMemo(
    () => resolveHomeCatalogHeaderLogoMaxWidth(screenWidth),
    [screenWidth],
  );

  const logoWidth = Math.min(
    logoMaxWidth,
    HOME_CATALOG_HEADER_LOGO_HEIGHT * aspectRatio,
  );

  const handleLogoLoad = useCallback((event: { source: { width: number; height: number } }) => {
    const { width, height } = event.source;
    if (width > 0 && height > 0) {
      setAspectRatio(width / height);
    }
  }, []);

  return (
    <Pressable
      style={[styles.logoButton, { width: logoWidth }]}
      accessibilityRole="button"
      accessibilityLabel={HOME_PAGE_UI.NAV_TO_HOME}
      onPress={onPress}
    >
      <Image
        source={HOME_CATALOG_BRAND_LOGO}
        style={[styles.logoImage, { width: logoWidth, aspectRatio }]}
        contentFit="contain"
        contentPosition="left center"
        accessibilityLabel={HOME_PAGE_UI.LOGO_ALT}
        onLoad={handleLogoLoad}
      />
    </Pressable>
  );
};
