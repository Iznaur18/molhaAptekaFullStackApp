import { StyleSheet } from "react-native";

import { PROMO_RETURN_STREAK_DOCK_LAYOUT as L } from "@/entities/promo-return-streak/lib/promoReturnStreakDockLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const usePromoReturnStreakDockStyles = createThemedStyles(() => ({
  shell: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: L.zIndex,
    pointerEvents: "box-none",
  },
  dock: {
    marginHorizontal: L.inset,
    paddingTop: L.paddingTop,
    paddingHorizontal: L.paddingX,
    paddingBottom: L.paddingBottom,
    borderRadius: L.radius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: L.bg,
    gap: L.gap,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: L.iconSize,
    height: L.iconSize,
    borderRadius: L.iconRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  headline: {
    flex: 1,
    minWidth: 0,
    gap: 1.6,
  },
  eyebrow: {
    margin: 0,
    fontSize: L.eyebrowFontSize,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: L.muted,
  },
  days: {
    margin: 0,
    fontSize: L.daysFontSize,
    fontWeight: "800",
    letterSpacing: 0.7,
    lineHeight: 24,
    textTransform: "uppercase",
    color: L.text,
  },
  subline: {
    marginTop: 2.4,
    fontSize: L.sublineFontSize,
    fontWeight: "600",
    color: L.muted,
  },
  claim: {
    minHeight: L.claimMinHeight,
    paddingHorizontal: L.claimPadX,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: L.green,
    shadowColor: L.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,
    elevation: 2,
  },
  claimDisabled: {
    opacity: 0.7,
  },
  claimLabel: {
    fontSize: L.claimFontSize,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: L.claimText,
  },
  description: {
    margin: 0,
    fontSize: L.descriptionFontSize,
    lineHeight: 16.8,
    color: L.muted,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: L.line,
  },
  track: {
    flexDirection: "row",
    gap: L.trackGap,
  },
  tick: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 4.5,
  },
  tickDot: {
    width: L.tickDot,
    height: L.tickDot,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: L.pending,
  },
  tickDotDone: {
    backgroundColor: L.green,
  },
  tickDotCurrent: {
    backgroundColor: L.bgSoft,
    borderWidth: 2.5,
    borderColor: L.green,
  },
  tickLabel: {
    fontSize: L.tickLabelFontSize,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: L.text,
  },
  tickPercent: {
    fontSize: L.tickPercentFontSize,
    fontWeight: "700",
    color: L.muted,
  },
  tickPercentActive: {
    color: L.green,
  },
  error: {
    margin: 0,
    fontSize: 12.16,
    color: L.error,
  },
}));
