import { StyleSheet } from "react-native";

import { SUBSCRIPTIONS_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import {
  PROFILE_LIST_HERO_CHROME as HERO,
  PROFILE_LIST_HERO_NO_SHADOW,
} from "@/shared/lib/profileListHeroChrome";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const SUBSCRIPTION_USER_ROW_BORDER_RADIUS = 16;

export const useSubscriptionsPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: layout.pageBackground,
  },
  listContent: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
    flexGrow: 1,
  },
  /** Desktop hub: gutter 0 как web `.subscriptions-page { padding: 0 }`. */
  listInAccountShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    alignSelf: "stretch",
    width: "100%",
    gap: L.headerGap,
    marginBottom: L.headerMarginBottom,
  },
  listItem: {
    marginTop: L.listGap,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: HERO.gap,
    padding: HERO.padding,
    borderRadius: HERO.radiusDefault,
    backgroundColor: theme.colors.action,
    ...PROFILE_LIST_HERO_NO_SHADOW,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  heroCaption: {
    fontSize: HERO.captionFontSize,
    fontWeight: theme.typography.fontWeightBold,
    textTransform: "uppercase",
    letterSpacing: HERO.captionLetterSpacing,
    color: theme.colors.onContrast,
    opacity: 0.72,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  heroValue: {
    fontSize: HERO.valueFontSize,
    fontWeight: HERO.valueFontWeight,
    letterSpacing: HERO.valueLetterSpacing,
    color: theme.colors.onContrast,
    fontVariant: ["tabular-nums"],
  },
  heroUnit: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.onContrast,
    opacity: 0.85,
  },
  heroInfo: {
    marginTop: 8,
    fontSize: theme.typography.fontSm,
    lineHeight: 19,
    color: theme.colors.onContrast,
    opacity: 0.8,
  },
  heroIconWrap: {
    width: HERO.iconSize,
    height: HERO.iconSize,
    borderRadius: HERO.iconSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  emptyRoot: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
  },
  emptyInAccountShell: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  emptyBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBlock: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  state: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 5.6,
    paddingHorizontal: 2.4,
  },
  stateError: {
    color: theme.colors.danger,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
    backgroundColor: layout.pageBackground,
  },
  hint: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 5.6,
    paddingHorizontal: 2.4,
  },
  loginButton: {
    alignSelf: "stretch",
    minHeight: 40.8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10.4,
    backgroundColor: theme.colors.link,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: 14.4,
  },
}));

export const useSubscriptionUserRowStyles = createThemedStyles((theme, layout) => ({
  pressable: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 0,
    elevation: 1,
  },
  rowPressed: {
    borderColor: theme.colors.link,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  nameWrap: {
    minWidth: 0,
  },
  nameText: {
    fontSize: 15.68,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 0,
  },
  metric: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    maxWidth: "100%",
  },
  metricLabel: {
    fontSize: theme.typography.font2xs,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  metricValue: {
    fontSize: 12.5,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  metricSep: {
    width: 3,
    height: 3,
    borderRadius: 999,
    marginHorizontal: 7,
    backgroundColor: theme.colors.textMuted,
    opacity: 0.55,
  },
}));
