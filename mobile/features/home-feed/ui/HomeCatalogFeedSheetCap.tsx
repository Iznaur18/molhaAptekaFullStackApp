import { StyleSheet, View } from "react-native";

import {
  HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT,
  HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS,
  HOME_CATALOG_PRIMARY_BACKDROP_COLOR,
} from "@/shared/lib/homeCatalogBackdropLayout";
import { useFeedScreenStyles } from "@/shared/theme/catalogProductStyles";

/**
 * Скруглённая верхняя кромка foreground-листа. Снаружи скругления — фиолетовый
 * фон шапки, поэтому уголки визуально «вырезаны» из фиолетового, без щелей.
 */
export const HomeCatalogFeedSheetCap = () => {
  const styles = useFeedScreenStyles();

  return (
    <View style={capStyles.backdropUnderlay}>
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
    backgroundColor: HOME_CATALOG_PRIMARY_BACKDROP_COLOR,
  },
  cap: {
    width: "100%",
    alignSelf: "stretch",
    height: HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT,
  },
});
