import { StyleSheet } from "react-native";

import { PROFILE_ACCOUNT_STACK_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import {
  PROFILE_LIST_HERO_CHROME as HERO,
  PROFILE_LIST_HERO_NO_SHADOW,
} from "@/shared/lib/profileListHeroChrome";
import { cancelButtonStyleBlock } from "@/shared/theme/cancelButtonChromeStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useAdvertisingPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: layout.pageBackground,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: L.stackGap,
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
  },
  contentInAccountShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    gap: 14,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: HERO.gap,
    padding: HERO.padding,
    borderRadius: HERO.radiusAdvertising,
    backgroundColor: theme.colors.infoDeep,
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
  cards: {
    gap: 16,
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
    fontSize: 14.4,
    lineHeight: 20.8,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: theme.colors.action,
  },
  loginButtonText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: 15.2,
  },
}));

export const useAdvertisingCardStyles = createThemedStyles((theme, layout) => ({
  ...cancelButtonStyleBlock(theme),
  card: {
    gap: 13.6,
    padding: 16,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  cardIntro: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.action,
  },
  cardDisabled: {
    opacity: 0.55,
    borderTopColor: theme.colors.textMuted,
    backgroundColor: theme.colors.surfaceElevated,
  },
  cardCategory: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.action,
  },
  cardBanner: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.action,
  },
  cardHead: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16.8,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.ink,
  },
  cardBadge: {
    paddingVertical: 3.2,
    paddingHorizontal: 8.8,
    borderRadius: 999,
    backgroundColor: theme.colors.actionSoft,
    color: theme.colors.action,
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightBold,
    overflow: "hidden",
  },
  cardBadgeDisabled: {
    backgroundColor: theme.colors.border,
    color: theme.colors.textMuted,
  },
  lead: {
    fontSize: 14.4,
    lineHeight: 20.8,
    color: theme.colors.textMuted,
  },
  unavailableNotice: {
    fontSize: 14.4,
    lineHeight: 20.8,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textMuted,
  },
  state: {
    fontSize: 14.4,
    lineHeight: 20.8,
    color: theme.colors.textMuted,
  },
  /** web `.advertising-page__meta` — equal flex, nowrap */
  meta: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "stretch",
    gap: 6.4,
    minWidth: 0,
  },
  metaItem: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    gap: 0.8,
    paddingVertical: 6.4,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  metaLabel: {
    fontSize: 9.92,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: 0.64,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
    lineHeight: 11.9,
  },
  metaValue: {
    fontSize: 13.12,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.ink,
    fontVariant: ["tabular-nums"],
    lineHeight: 16.4,
  },
  metaList: {
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  statusPanel: {
    gap: 8.8,
    paddingVertical: 10.4,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  statusPanelActive: {
    borderColor: theme.colors.successSurface,
    backgroundColor: theme.colors.successSurface,
  },
  statusPanelPending: {
    borderColor: theme.colors.warningBorder,
    backgroundColor: theme.colors.warningSurface,
  },
  statusText: {
    fontSize: 14.08,
    lineHeight: 19.7,
    color: theme.colors.textSecondary,
  },
  statusTextActive: {
    color: theme.colors.successText,
  },
  panel: {
    gap: 13.6,
    padding: 13.6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  panelTitle: {
    fontSize: 13.12,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: 0.48,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  form: {
    gap: 13.6,
  },
  field: {
    gap: 5.6,
  },
  fieldLabel: {
    fontSize: 14.08,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  /** web `.advertising-page__input` */
  input: {
    width: "100%",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingHorizontal: 10.4,
    paddingVertical: 8,
    fontSize: theme.typography.fontMd,
    fontWeight: "400",
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  timingLegend: {
    fontSize: 14.08,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textSecondary,
  },
  timingHint: {
    fontSize: 13.12,
    lineHeight: 18.9,
    color: theme.colors.textMuted,
  },
  timingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10.4,
  },
  timingField: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 144,
    gap: 5.6,
  },
  /** web `.advertising-page__tariffs` — auto-fit min 6.5rem */
  tariffs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tariff: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 104,
    minWidth: 104,
    gap: 2.4,
    paddingVertical: 9.6,
    paddingHorizontal: 10.4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tariffSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  tariffTitle: {
    fontSize: 13.12,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.ink,
  },
  tariffPrice: {
    fontSize: 12.48,
    color: theme.colors.textMuted,
  },
  /** web `.advertising-page__actions` — equal flex app-btn */
  actions: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "stretch",
    gap: 8,
  },
  /** CTA вне формы (web standalone `.app-btn`) */
  primaryButton: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  /** Кнопка внутри `.actions` — flex:1 */
  actionsButton: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignSelf: "stretch",
    minHeight: 44,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: 15,
    textAlign: "center",
  },
  /** web `.advertising-page .app-btn--secondary` */
  secondaryButton: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonDisabled: {
    opacity: 0.55,
  },
  secondaryButtonText: {
    color: theme.colors.action,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: 15,
    textAlign: "center",
  },
  error: {
    fontSize: 14.08,
    lineHeight: 20.2,
    color: theme.colors.danger,
  },
  feedback: {
    paddingVertical: 8.8,
    paddingHorizontal: 11.2,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.successSurface,
    backgroundColor: theme.colors.successSurface,
    color: theme.colors.successText,
    fontSize: 14.4,
    lineHeight: 20.2,
  },
}));
