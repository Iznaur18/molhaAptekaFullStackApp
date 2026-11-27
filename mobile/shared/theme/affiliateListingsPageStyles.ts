import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** web `AffiliateListingsPage.css` — card + deal. */
export const useAffiliateListingsPageStyles = createThemedStyles((theme) => ({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 16.8,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textMuted,
  },
  meta: {
    fontSize: 15.2,
    color: theme.colors.textMuted,
  },
  list: {
    gap: 10.4,
  },
  empty: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  deal: {
    gap: 10,
    minWidth: 0,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  dealHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    minWidth: 0,
  },
  dealTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 14.4,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: 18.7,
    color: theme.colors.text,
  },
  dealStatus: {
    flexShrink: 0,
    paddingVertical: 3.2,
    paddingHorizontal: 8.8,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: theme.typography.fontWeightSemibold,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textSecondary,
  },
  dealStatusPaid: {
    backgroundColor: theme.colors.successSurface,
    color: theme.colors.successText,
  },
  dealStatusPending: {
    backgroundColor: theme.colors.warningSurface,
    color: theme.colors.warningText,
  },
  dealStatusSkipped: {
    backgroundColor: theme.colors.dangerSurface,
    color: theme.colors.dangerText,
  },
  dealFacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    columnGap: 12,
  },
  dealFact: {
    width: "47%",
    flexGrow: 1,
    minWidth: 0,
    gap: 1.6,
  },
  dealFactLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  dealFactValue: {
    fontSize: 14.4,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  dealFactValueAccent: {
    color: theme.colors.action,
  },
  dealDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
}));
