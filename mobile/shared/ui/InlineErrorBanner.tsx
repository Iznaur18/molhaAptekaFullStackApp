import { type ReactNode } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { INLINE_ERROR_BANNER_LAYOUT as L } from "@/shared/lib/inlineErrorBannerLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

type InlineErrorBannerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Паритет web `InlineErrorBanner` — mark «!» + текст, role=alert.
 */
export const InlineErrorBanner = ({ children, style }: InlineErrorBannerProps) => {
  const styles = useStyles();

  return (
    <View style={[styles.banner, style]} accessibilityRole="alert">
      <Text style={styles.mark} accessibilityElementsHidden>
        !
      </Text>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
};

/** color-mix(danger 28% / 18%, transparent) ≈ #rrggbb + aa */
const DANGER_BORDER_AA = "47";
const DANGER_MARK_BG_AA = "2e";

const useStyles = createThemedStyles((theme) => ({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: L.gap,
    marginBottom: L.marginBottom,
    paddingVertical: L.paddingY,
    paddingHorizontal: L.paddingX,
    borderWidth: L.borderWidth,
    borderRadius: L.radius,
    borderColor: `${theme.colors.danger}${DANGER_BORDER_AA}`,
    backgroundColor: theme.colors.dangerSurface,
  },
  mark: {
    width: L.markSize,
    height: L.markSize,
    marginTop: L.markMarginTop,
    borderRadius: 999,
    overflow: "hidden",
    textAlign: "center",
    lineHeight: L.markSize,
    fontSize: L.markFontSize,
    fontWeight: "700",
    color: theme.colors.danger,
    backgroundColor: `${theme.colors.danger}${DANGER_MARK_BG_AA}`,
  },
  text: {
    flex: 1,
    margin: 0,
    fontSize: L.textFontSize,
    lineHeight: L.textLineHeight,
    color: theme.colors.dangerText,
  },
}));
