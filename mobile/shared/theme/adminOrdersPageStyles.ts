import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const TOOLBAR_PADDING_VERTICAL = 10.4;
const TOOLBAR_PADDING_HORIZONTAL = 12;
const TOOLBAR_RADIUS = 10.4;
const TOOLBAR_GAP = 8;
const CHIP_GAP = 5.6;
const CHIP_PADDING_VERTICAL = 3.5;
const CHIP_PADDING_HORIZONTAL = 8.8;
const LIST_GAP = 12;
const NEUTRAL_GRAY_DEEP = "#4b5563";
const DANGER_ACCENT = "#dc2626";

export const useAdminOrdersPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  listFlex: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    gap: LIST_GAP,
    flexGrow: 1,
  },
  header: {
    gap: 13.6,
    paddingTop: 12,
    paddingBottom: 12,
  },
  toolbar: {
    gap: TOOLBAR_GAP,
    paddingVertical: TOOLBAR_PADDING_VERTICAL,
    paddingHorizontal: TOOLBAR_PADDING_HORIZONTAL,
    borderRadius: TOOLBAR_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(31, 111, 235, 0.28)",
    backgroundColor: "#eff6ff",
  },
  toolbarHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  toolbarHeading: {
    flex: 1,
    fontSize: 15.2,
    fontWeight: "600",
    color: theme.colors.text,
  },
  ordersCount: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
  },
  statusChips: {
    gap: CHIP_GAP,
    paddingVertical: 2.4,
  },
  statusChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: CHIP_PADDING_VERTICAL,
    paddingHorizontal: CHIP_PADDING_HORIZONTAL,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  statusChipText: {
    fontSize: 14.4,
    fontWeight: "600",
    lineHeight: 18.7,
    color: theme.colors.textSecondary,
  },
  statusChipTextActive: {
    color: theme.colors.onContrast,
  },
  state: {
    fontSize: 15.2,
    lineHeight: 22,
    color: NEUTRAL_GRAY_DEEP,
  },
  stateError: {
    color: DANGER_ACCENT,
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

export const useOrderStatusSelectStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13.6,
    color: theme.colors.textSecondary,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.surface,
  },
  optionSelected: {
    borderColor: theme.colors.link,
    backgroundColor: `${theme.colors.link}14`,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 13.6,
    fontWeight: "500",
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.link,
    fontWeight: "600",
  },
  pending: {
    fontSize: 12.8,
    color: theme.colors.textMuted,
  },
  error: {
    width: "100%",
    fontSize: 12.8,
    lineHeight: 18,
    color: DANGER_ACCENT,
  },
}));
