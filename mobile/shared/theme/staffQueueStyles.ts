import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useStaffQueueStyles = createThemedStyles((theme) => ({
  list: {
    padding: theme.spacing[3],
    gap: theme.spacing[4],
  },
  listPadded: {
    padding: theme.spacing[3],
    gap: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  row: {
    gap: theme.spacing[2],
    paddingBottom: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  titleAccent: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.link,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  link: {
    fontSize: 14,
    color: theme.colors.link,
  },
  linkLarge: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.link,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  count: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  header: {
    gap: 10,
    marginBottom: theme.spacing[2],
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: theme.spacing[2],
    marginBottom: 4,
    color: theme.colors.text,
  },
  actions: {
    gap: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  caption: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  reportText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  mediaWrap: {
    height: 200,
    borderRadius: theme.radius.button,
    overflow: "hidden",
    backgroundColor: theme.colors.nearBlack,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.button,
  },
  empty: {
    textAlign: "center",
    color: theme.colors.textMuted,
    padding: theme.spacing[6],
  },
}));

export const useStaffFilterChipStyles = createThemedStyles((theme) => ({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 6,
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  chipText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  chipTextSmall: {
    fontSize: 12,
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: theme.colors.action,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
}));
