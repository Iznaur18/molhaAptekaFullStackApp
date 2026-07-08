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
const LIST_GAP = 16;

export const useInstallmentPaymentsPageStyles = createThemedStyles((theme) => ({
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
    borderColor: "rgba(79, 70, 229, 0.28)",
    backgroundColor: theme.colors.actionSoft,
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
  contractsCount: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
  },
  statusChips: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  emptyState: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
  },
  hint: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.action,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
  overview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  overviewTile: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    paddingVertical: 9.6,
    paddingHorizontal: 10.4,
    borderRadius: 8.8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  overviewTileActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  overviewTileAttention: {
    borderColor: "rgba(245, 158, 11, 0.45)",
  },
  overviewTileStatic: {
    opacity: 1,
  },
  overviewLabel: {
    fontSize: 11.2,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  overviewValueAttention: {
    color: theme.colors.warningText,
  },
  listActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  listAction: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 3.5,
    paddingHorizontal: 8.8,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  listActionText: {
    fontSize: 13.1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  filterHint: {
    flexBasis: "100%",
    fontSize: 13.1,
    color: theme.colors.textMuted,
  },
}));
