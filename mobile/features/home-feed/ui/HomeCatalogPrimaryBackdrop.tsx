import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  HOME_CATALOG_PRIMARY_BACKDROP_COLOR,
  resolveHomeCatalogPrimaryBackdropHeight,
} from "@/shared/lib/homeCatalogBackdropLayout";

export const HomeCatalogPrimaryBackdrop = () => {
  const insets = useSafeAreaInsets();
  const height = resolveHomeCatalogPrimaryBackdropHeight(insets.top);

  return (
    <View
      pointerEvents="none"
      style={[styles.backdrop, { height, backgroundColor: HOME_CATALOG_PRIMARY_BACKDROP_COLOR }]}
    />
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
});
