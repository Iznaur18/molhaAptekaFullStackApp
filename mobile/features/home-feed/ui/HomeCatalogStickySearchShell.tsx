import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

type HomeCatalogStickySearchShellProps = {
  children: ReactNode;
};

export const HomeCatalogStickySearchShell = ({ children }: HomeCatalogStickySearchShellProps) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppThemeSettings();

  return (
    <View
      collapsable={false}
      style={[
        styles.shell,
        {
          backgroundColor: theme.colors.surface,
          paddingTop: insets.top,
        },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    alignSelf: "stretch",
    zIndex: 2,
  },
});
