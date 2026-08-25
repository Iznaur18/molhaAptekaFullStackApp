import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { mixHexColors } from "@/shared/lib/mixHexColors";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

/**
 * Плашка обратного отсчёта горящей скидки.
 * Портировано из `client/.../ProductDetailsFlashSaleCountdown.css`: rem → px
 * (1rem = 16px), `color-mix` → `mixHexColors`.
 */
export const useProductFlashSaleCountdownStyles = () => {
  const theme = useAppTheme();

  return useMemo(() => {
    const c = theme.colors;
    const accent = c.warning;
    const urgentAccent = c.danger;

    const styles = StyleSheet.create({
      root: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 2,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: mixHexColors(accent, c.border, 0.28),
        borderRadius: 16,
        backgroundColor: c.warningSurface,
      },
      rootUrgent: {
        borderColor: mixHexColors(urgentAccent, c.border, 0.32),
        backgroundColor: c.dangerSurface,
      },
      lead: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
        minWidth: 0,
      },
      icon: {
        position: "relative",
        flexShrink: 0,
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10.8,
        backgroundColor: mixHexColors(accent, c.surface, 0.16),
      },
      iconUrgent: {
        backgroundColor: mixHexColors(urgentAccent, c.surface, 0.16),
      },
      /** Фолбэк, когда длительность неизвестна и прогресс не посчитать. */
      iconStaticBorder: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 2,
        borderRadius: 10.8,
      },
      info: {
        flexDirection: "column",
        gap: 2,
        flexShrink: 1,
        minWidth: 0,
      },
      titleRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
      },
      title: {
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 16.25,
        color: c.warningText,
      },
      titleUrgent: {
        color: c.dangerText,
      },
      discount: {
        overflow: "hidden",
        paddingVertical: 1.6,
        paddingHorizontal: 6.4,
        borderRadius: 999,
        backgroundColor: accent,
        color: c.onContrast,
        fontSize: 11,
        fontWeight: "800",
        lineHeight: 13.2,
        letterSpacing: 0.11,
      },
      discountUrgent: {
        backgroundColor: urgentAccent,
      },
      caption: {
        fontSize: 11,
        fontWeight: "500",
        lineHeight: 14.3,
        color: mixHexColors(c.warningText, c.textMuted, 0.72),
      },
      captionUrgent: {
        color: mixHexColors(c.dangerText, c.textMuted, 0.72),
      },
      timer: {
        flexDirection: "row",
        flexShrink: 0,
        alignItems: "center",
        gap: 2.4,
      },
      unit: {
        minWidth: 28,
        paddingVertical: 3.5,
        paddingHorizontal: 5.6,
        borderRadius: 6,
        overflow: "hidden",
        textAlign: "center",
        backgroundColor: mixHexColors(c.surface, c.warningSurface, 0.88),
        color: c.warningText,
        fontSize: 15,
        fontWeight: "800",
        lineHeight: 16.5,
      },
      unitUrgent: {
        backgroundColor: mixHexColors(c.surface, c.dangerSurface, 0.88),
        color: c.dangerText,
      },
      sep: {
        flexShrink: 0,
        color: mixHexColors(c.warningText, c.warningSurface, 0.45),
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 13,
      },
      sepUrgent: {
        color: mixHexColors(c.dangerText, c.dangerSurface, 0.45),
      },
      expired: {
        flexShrink: 0,
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 15.6,
        color: c.dangerText,
      },
    });

    return {
      ...styles,
      /** Цвета для svg/иконки — StyleSheet сюда не годится. */
      tokens: {
        accent,
        urgentAccent,
        borderTrack: mixHexColors(accent, c.border, 0.22),
      },
    };
  }, [theme]);
};
