import { StyleSheet, View } from "react-native";

import {
  HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT,
  HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS,
} from "@/shared/lib/homeCatalogBackdropLayout";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

export const HomeCatalogFeedSheetCap = () => {
  const { theme } = useAppThemeSettings();

  return (
    <View
      style={[
        styles.cap,
        {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS,
          borderTopRightRadius: HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  cap: {
    width: "100%",
    alignSelf: "stretch",
    height: HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT,
  },
});
