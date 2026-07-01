import { StyleSheet } from "react-native";

import { RAFFLE_FEATURED_PALETTE as P } from "@/entities/raffle/lib/raffleFeaturedPalette";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const withAlpha = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`;

export const useRaffleSellerOverviewStyles = createThemedStyles((theme) => ({
  root: {
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(P.accentPurple, "47"),
    borderRadius: 12,
    backgroundColor: withAlpha(P.accentPurpleSoft, "66"),
  },
  title: {
    marginBottom: 8,
    fontSize: 15.2,
    fontWeight: "600",
    color: theme.colors.text,
  },
  empty: {
    fontSize: 13.6,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  state: {
    marginBottom: 16,
    fontSize: 13.6,
    color: theme.colors.textMuted,
  },
  stateError: {
    marginBottom: 16,
    fontSize: 13.6,
    color: theme.colors.danger,
  },
  current: {
    gap: 0,
  },
  name: {
    marginBottom: 3,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  status: {
    marginBottom: 8,
    fontSize: 13.1,
    color: theme.colors.textMuted,
  },
  comment: {
    marginBottom: 8,
    fontSize: 12.8,
    lineHeight: 18,
    color: P.warningBrownDeep,
  },
  inlineError: {
    marginBottom: 8,
    fontSize: 13.6,
    color: theme.colors.danger,
  },
  actions: {
    marginTop: 8,
  },
  archive: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: withAlpha(theme.colors.text, "1F"),
    gap: 6,
  },
  archiveTitle: {
    fontSize: 13.1,
    fontWeight: "600",
    color: theme.colors.text,
  },
  archiveItem: {
    fontSize: 12.8,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
}));
