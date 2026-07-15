import { StyleSheet, View } from "react-native";

import { IS_HOME_FEED_INTRO_BACKDROP_ENABLED } from "@/features/home-feed/model/isHomeFeedIntroBackdropEnabled";
import {
  HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT,
  HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS,
} from "@/shared/lib/homeCatalogBackdropLayout";
import { useFeedScreenStyles } from "@/shared/theme/catalogProductStyles";

/**
 * Скруглённая верхняя кромка foreground-листа.
 * С intro: под скруглением прозрачно — видео видно в уголках.
 * Без intro: непрозрачный underlay, иначе на мгновение просвечивает чёрный сцены.
 */
export const HomeCatalogFeedSheetCap = () => {
  const styles = useFeedScreenStyles();

  return (
    <View
      style={[
        capStyles.backdropUnderlay,
        IS_HOME_FEED_INTRO_BACKDROP_ENABLED ? null : styles.homeFeedForeground,
      ]}
    >
      <View
        style={[
          styles.homeFeedForeground,
          capStyles.cap,
          {
            borderTopLeftRadius: HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS,
            borderTopRightRadius: HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS,
          },
        ]}
      />
    </View>
  );
};

const capStyles = StyleSheet.create({
  backdropUnderlay: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "transparent",
  },
  cap: {
    width: "100%",
    alignSelf: "stretch",
    height: HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT,
  },
});
