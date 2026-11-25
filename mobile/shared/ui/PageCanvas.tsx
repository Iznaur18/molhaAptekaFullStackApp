import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

type PageCanvasProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** По умолчанию `flex: 1` + pageBackground. */
  testID?: string;
};

const usePageCanvasStyles = createThemedStyles((_theme, layout) => ({
  root: {
    flex: 1,
    backgroundColor: layout.pageBackground,
  },
}));

/**
 * Корень экрана: фон = `resolvePageBackground` (паритет web page canvas).
 * Карточки/инпуты — `theme.colors.surface` / `colors.bg`, не этот wrapper.
 */
export const PageCanvas = ({ children, style, testID }: PageCanvasProps) => {
  const styles = usePageCanvasStyles();
  return (
    <View style={[styles.root, style]} testID={testID}>
      {children}
    </View>
  );
};
