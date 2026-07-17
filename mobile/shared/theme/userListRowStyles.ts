import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const USER_LIST_ROW_AVATAR_SIZE = Math.round(52 * 1.2);

/** Узкая плитка users-grid (2 колонки на телефоне) — метрики в одну колонку. */
export const USER_LIST_ROW_METRICS_STACK_MAX_CARD_WIDTH = 240;

export const resolveUserListRowMetricsStacked = (cardWidth: number): boolean =>
  cardWidth > 0 && cardWidth <= USER_LIST_ROW_METRICS_STACK_MAX_CARD_WIDTH;

export const useUserListRowStyles = createThemedStyles((theme) => ({  row: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  rowPressed: {
    borderColor: theme.colors.action,
    opacity: 0.96,
  },
  head: {
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: USER_LIST_ROW_AVATAR_SIZE,
    height: USER_LIST_ROW_AVATAR_SIZE,
  },
  nameWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  nameText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  email: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceMuted,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: "auto",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  metricsStacked: {
    flexDirection: "column",
    flexWrap: "nowrap",
  },
  metricCell: {
    width: "48%",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceMuted,
  },
  metricCellStacked: {
    width: "100%",
    alignSelf: "stretch",
    flexGrow: 0,
    flexShrink: 0,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textMuted,
    lineHeight: 13,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  metricValueAmount: {
    fontSize: 12,
  },
  metricValueMuted: {
    fontSize: 11,
    fontWeight: "600",
  },
}));
