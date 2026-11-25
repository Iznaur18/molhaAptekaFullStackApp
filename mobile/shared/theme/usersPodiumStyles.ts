import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const PODIUM_AVATAR_SIZE_FIRST = 72;
const PODIUM_AVATAR_SIZE_OTHER = 56;
const PODIUM_PLACE_BADGE_SIZE = 24;

export const useUsersPodiumStyles = createThemedStyles((theme) => ({
  root: {
    gap: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: theme.typography.fontSm,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
  },
  slot: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  slotPressed: {
    opacity: 0.94,
    borderColor: theme.colors.action,
  },
  slotPlace1: {
    paddingTop: 18,
    paddingBottom: 16,
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningSurface,
  },
  slotPlace2: {
    borderColor: `${theme.colors.textMuted}66`,
    backgroundColor: theme.colors.surfaceElevated,
  },
  slotPlace3: {
    borderColor: `${theme.colors.warningText}59`,
    backgroundColor: theme.colors.warningSurface,
  },
  placeBadge: {
    minWidth: PODIUM_PLACE_BADGE_SIZE,
    height: PODIUM_PLACE_BADGE_SIZE,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  placeBadge1: {
    backgroundColor: theme.colors.warning,
  },
  placeBadge2: {
    backgroundColor: theme.colors.textMuted,
  },
  placeBadge3: {
    backgroundColor: theme.colors.warningText,
  },
  placeBadgeText: {
    fontSize: theme.typography.fontXs,
    fontWeight: "800",
    color: theme.colors.onContrast,
  },
  avatarPlace1: {
    width: PODIUM_AVATAR_SIZE_FIRST,
    height: PODIUM_AVATAR_SIZE_FIRST,
  },
  avatarPlaceOther: {
    width: PODIUM_AVATAR_SIZE_OTHER,
    height: PODIUM_AVATAR_SIZE_OTHER,
  },
  nameText: {
    textAlign: "center",
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  placeLabel: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  metrics: {
    width: "100%",
    gap: 3,
    alignItems: "center",
  },
  metricRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    width: "100%",
  },
  metricLabel: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  metricValue: {
    flexShrink: 0,
    fontSize: theme.typography.font2xl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
}));

export const useUsersPagePodiumListStyles = createThemedStyles(() => ({
  listHeader: {
    gap: 12,
    paddingBottom: 12,
  },
}));
