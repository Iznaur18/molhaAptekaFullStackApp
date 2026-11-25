import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useIntroAdModerationCampaignCardStyles = createThemedStyles((theme) => ({
  card: {
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  meta: {
    margin: 0,
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  secondaryButton: {
    paddingVertical: 7.2,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  primaryButton: {
    paddingVertical: 7.2,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.link,
    backgroundColor: theme.colors.link,
  },
  dangerButton: {
    paddingVertical: 7.2,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.surface,
  },
  cancelButton: {
    paddingVertical: 7.2,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    backgroundColor: theme.colors.danger,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  secondaryButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.text,
  },
  primaryButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.onContrast,
  },
  dangerButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.danger,
  },
  cancelButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.onContrast,
  },
  rejectLabel: {
    gap: 6,
    fontSize: theme.typography.fontBase,
    color: theme.colors.textSecondary,
  },
  rejectInput: {
    minHeight: 72,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    textAlignVertical: "top",
  },
  bannerPreview: {
    width: "100%",
    maxHeight: 120,
    borderRadius: 8,
  },
  bannerCarouselPreview: {
    width: "100%",
  },
}));
