import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const THUMB_SIZE = 72;

export const useRafflesStaffPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
    gap: 12,
  },
  header: {
    marginBottom: 4,
  },
  liveSection: {
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  list: {
    gap: 12,
  },
  row: {
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  rowLive: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  rowMain: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    flexShrink: 0,
    backgroundColor: theme.colors.surfaceMuted,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  thumbVideo: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: theme.colors.ink,
  },
  thumbPlaceholder: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: theme.colors.surfaceMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  rowError: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.danger,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionPrimary: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.link,
  },
  actionDanger: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    backgroundColor: `${theme.colors.danger}14`,
  },
  actionEdit: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.link,
    backgroundColor: `${theme.colors.link}14`,
  },
  actionDisabled: {
    opacity: 0.65,
  },
  actionPrimaryText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onContrast,
  },
  actionDangerText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.danger,
  },
  actionEditText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.link,
  },
  state: {
    fontSize: 15.2,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  empty: {
    fontSize: 15.2,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
  },
}));
