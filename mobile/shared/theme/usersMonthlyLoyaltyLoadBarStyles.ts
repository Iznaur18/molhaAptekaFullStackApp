import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useUsersMonthlyLoyaltyLoadBarStyles = createThemedStyles((theme) => ({
  root: {
    gap: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  counter: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  track: {
    height: 10,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: theme.colors.action,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
}));
