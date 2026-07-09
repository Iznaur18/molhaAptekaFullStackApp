import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFeedScreenStyles } from "@/shared/theme/catalogProductStyles";

type HomeCatalogStickySearchShellProps = {
  children: ReactNode;
};

export const HomeCatalogStickySearchShell = ({ children }: HomeCatalogStickySearchShellProps) => {
  const insets = useSafeAreaInsets();
  const styles = useFeedScreenStyles();

  return (
    <View
      collapsable={false}
      style={[
        shellStyles.shell,
        styles.homeFeedForeground,
        { paddingTop: insets.top },
      ]}
    >
      {children}
    </View>
  );
};

const shellStyles = StyleSheet.create({
  shell: {
    width: "100%",
    alignSelf: "stretch",
    zIndex: 100,
    elevation: 100,
  },
});
