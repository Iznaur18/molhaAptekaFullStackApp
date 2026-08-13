import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const LIST_GAP = 4;

export const SUBSCRIPTION_USER_ROW_BORDER_RADIUS = 16;

export const useSubscriptionsPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  listContent: {
    gap: LIST_GAP,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
  },
  header: {
    alignSelf: "stretch",
    width: "100%",
    gap: 14,
    marginBottom: 10,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 20,
    borderRadius: 18,
    backgroundColor: theme.colors.action,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  heroCaption: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: theme.colors.onContrast,
    opacity: 0.72,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: theme.colors.onContrast,
    fontVariant: ["tabular-nums"],
  },
  heroUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onContrast,
    opacity: 0.85,
  },
  heroInfo: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.onContrast,
    opacity: 0.8,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  emptyRoot: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
  },
  emptyBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  state: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 5.6,
    paddingHorizontal: 2.4,
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
    fontWeight: "600",
    fontSize: 14.4,
  },
}));

export const useSubscriptionUserRowStyles = createThemedStyles((theme) => ({
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
    fontWeight: "600",
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
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  metricValue: {
    fontSize: 12.5,
    fontWeight: "700",
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
