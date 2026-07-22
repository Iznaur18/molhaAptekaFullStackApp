import { useMemo, type ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  MOBILE_BOTTOM_NAV_FLOAT_OFFSET,
  resolveMobileBottomNavHorizontalInset,
} from "@/shared/lib/mobileBottomNavLayout";
import { resolveContentMaxWidth } from "@/shared/lib/screenBreakpoints";

type HomeCatalogStickySearchShellProps = {
  children: ReactNode;
};

/**
 * Absolute overlay поверх ленты. Контент отталкивается
 * `resolveHomeCatalogOverlayContentInsetTop`; при скролле уходит под glass.
 */
export const HomeCatalogStickySearchShell = ({ children }: HomeCatalogStickySearchShellProps) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const horizontalInset = resolveMobileBottomNavHorizontalInset(insets);
  const contentMaxWidth = useMemo(
    () => resolveContentMaxWidth(windowWidth),
    [windowWidth],
  );

  return (
    <View
      pointerEvents="box-none"
      collapsable={false}
      style={[
        shellStyles.shell,
        {
          paddingTop: insets.top + MOBILE_BOTTOM_NAV_FLOAT_OFFSET,
          paddingHorizontal: horizontalInset,
        },
      ]}
    >
      <View
        pointerEvents="box-none"
        style={[
          shellStyles.barWrap,
          contentMaxWidth != null ? { maxWidth: contentMaxWidth } : null,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const shellStyles = StyleSheet.create({
  shell: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 100,
    backgroundColor: "transparent",
  },
  barWrap: {
    width: "100%",
    alignSelf: "center",
  },
});
