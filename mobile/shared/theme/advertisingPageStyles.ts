import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { cancelButtonStyleBlock } from "@/shared/theme/cancelButtonChromeStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";



export const useAdvertisingPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: 16,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
  },
  header: {
    gap: 13.6,
  },
  pageLead: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textMuted,
  },
  balanceBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 11.2,
    paddingHorizontal: 14.4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.actionSoft,
  },
  balanceLabel: {
    fontSize: 12.48,
    fontWeight: "700",
    letterSpacing: 0.64,
    textTransform: "uppercase",
    color: theme.colors.action,
  },
  balanceValue: {
    fontSize: 16.8,
    fontWeight: "800",
    color: theme.colors.ink,
    fontVariant: ["tabular-nums"],
  },
  cards: {
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
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
    borderRadius: 10,
    backgroundColor: theme.colors.action,
  },
  loginButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 15.2,
  },
}));

export const useAdvertisingCardStyles = createThemedStyles((theme) => ({
  ...cancelButtonStyleBlock(theme),
  card: {
    gap: 13.6,
    padding: 16,
    borderRadius: 14,
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
    fontWeight: "700",
    color: theme.colors.ink,
  },
  cardBadge: {
    paddingVertical: 3.2,
    paddingHorizontal: 8.8,
    borderRadius: 999,
    backgroundColor: theme.colors.actionSoft,
    color: theme.colors.action,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
  lead: {
    fontSize: 14.4,
    lineHeight: 20.8,
    color: theme.colors.textMuted,
  },
  state: {
    fontSize: 14.4,
    lineHeight: 20.8,
    color: theme.colors.textMuted,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaItem: {
    gap: 1.6,
    minWidth: 120,
    paddingVertical: 8.8,
    paddingHorizontal: 11.2,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  metaLabel: {
    fontSize: 10.88,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: theme.colors.action,
  },
  metaValue: {
    fontSize: 14.72,
    fontWeight: "700",
    color: theme.colors.ink,
    fontVariant: ["tabular-nums"],
  },
  statusPanel: {
    gap: 8.8,
    paddingVertical: 10.4,
    paddingHorizontal: 12,
    borderRadius: 10,
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
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  panelTitle: {
    fontSize: 13.12,
    fontWeight: "700",
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
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 10.4,
    paddingVertical: 8,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  timingLegend: {
    fontSize: 14.08,
    fontWeight: "700",
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
  tariffs: {
    gap: 8,
  },
  tariff: {
    gap: 2.4,
    paddingVertical: 9.6,
    paddingHorizontal: 10.4,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tariffSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  tariffTitle: {
    fontSize: 13.12,
    fontWeight: "700",
    color: theme.colors.ink,
  },
  tariffPrice: {
    fontSize: 12.48,
    color: theme.colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: theme.colors.action,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 15.2,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonDisabled: {
    opacity: 0.55,
  },
  secondaryButtonText: {
    color: theme.colors.action,
    fontWeight: "600",
    fontSize: 15.2,
  },
  error: {
    fontSize: 14.08,
    lineHeight: 20.2,
    color: theme.colors.danger,
  },
  feedback: {
    paddingVertical: 8.8,
    paddingHorizontal: 11.2,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.successSurface,
    backgroundColor: theme.colors.successSurface,
    color: theme.colors.successText,
    fontSize: 14.4,
    lineHeight: 20.2,
  },
}));
