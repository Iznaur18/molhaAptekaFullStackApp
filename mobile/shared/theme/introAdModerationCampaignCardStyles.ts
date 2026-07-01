import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const DANGER_STRONG = "#b42318";

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
    fontSize: 14,
    lineHeight: 20,
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
    borderColor: DANGER_STRONG,
    backgroundColor: theme.colors.surface,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onContrast,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: DANGER_STRONG,
  },
  rejectLabel: {
    gap: 6,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  rejectInput: {
    minHeight: 72,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    textAlignVertical: "top",
  },
}));
