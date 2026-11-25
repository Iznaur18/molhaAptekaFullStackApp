import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** Стили конструктора игр в разделе «Реклама» (паритет web lucky-box / fortune-wheel admin). */
export const useAdvertisingGameAdminStyles = createThemedStyles((theme) => ({
  form: {
    gap: 14.4,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
  },
  toggleLabel: {
    fontSize: 14.08,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
    flexShrink: 1,
  },
  builderHint: {
    fontSize: 12.8,
    lineHeight: 18.4,
    color: theme.colors.textSecondary,
  },
  boxesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9.6,
  },
  boxCell: {
    width: "31%",
    aspectRatio: 1,
  },
  box: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 6,
  },
  boxPrize: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  boxSelected: {
    borderColor: theme.colors.action,
    shadowColor: theme.colors.action,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  boxDiscount: {
    fontSize: theme.typography.fontLg,
    fontWeight: "800",
    color: theme.colors.action,
  },
  boxSub: {
    fontSize: 11.2,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  boxSubPrize: {
    color: theme.colors.action,
  },
  paletteLabel: {
    fontSize: 12.48,
    color: theme.colors.textMuted,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6.4,
  },
  chip: {
    paddingVertical: 7.2,
    paddingHorizontal: 12.8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  chipLabel: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textSecondary,
  },
  chipLabelActive: {
    color: theme.colors.onContrast,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  builderNote: {
    fontSize: theme.typography.fontXs,
    lineHeight: 17.6,
    color: theme.colors.textMuted,
  },
  countRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  countLabel: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  prizeBlock: {
    gap: 12,
    padding: 14.4,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  prizeBlockDisabled: {
    opacity: 0.72,
  },
  prizeHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  prizeTitle: {
    flex: 1,
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.action,
  },
  prizeTitleMuted: {
    color: theme.colors.textMuted,
  },
  prizeFields: {
    gap: 12.8,
  },
  prizeFieldsFaded: {
    opacity: 0.55,
  },
  adminField: {
    gap: 4.8,
  },
  adminFieldLabel: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  adminInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9.6,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  adminFieldHint: {
    fontSize: 11.2,
    color: theme.colors.textMuted,
  },
  stats: {
    fontSize: 12.48,
    color: theme.colors.textMuted,
  },
  modeSwitch: {
    alignSelf: "flex-start",
  },
  modeSwitchText: {
    fontSize: 13.12,
    color: theme.colors.action,
    textDecorationLine: "underline",
  },
  wheelStage: {
    alignSelf: "center",
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelPointer: {
    position: "absolute",
    top: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: theme.colors.ink,
    zIndex: 2,
  },
  wheelSvgWrap: {
    width: 200,
    height: 200,
  },
  chanceInfo: {
    fontSize: 12.8,
    lineHeight: 18.4,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  chanceTotal: {
    fontSize: 13.12,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.danger,
  },
  chanceTotalOk: {
    color: theme.colors.successText,
  },
  linkButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  linkButtonText: {
    fontSize: 13.12,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.action,
  },
  linkButtonDisabled: {
    opacity: 0.45,
  },
}));