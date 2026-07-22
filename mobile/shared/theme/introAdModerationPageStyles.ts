import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useIntroAdModerationPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
    gap: 16,
  },
  header: {
    marginBottom: 4,
    gap: 12,
  },
  toolbar: {
    gap: 8,
    paddingVertical: 10.4,
    paddingHorizontal: 12,
    borderRadius: 10.4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(124, 58, 237, 0.28)",
    backgroundColor: theme.colors.accentSoft,
  },
  toolbarHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  toolbarMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toolbarHeading: {
    flex: 1,
    fontSize: 15.2,
    fontWeight: "600",
    color: theme.colors.text,
  },
  queueCount: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  refreshButton: {
    minWidth: 72,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  refreshText: {
    fontSize: 12.8,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  sectionChips: {
    gap: 5.6,
    paddingVertical: 2.4,
  },
  sectionChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 3.5,
    paddingHorizontal: 8.8,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  sectionChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  sectionChipText: {
    fontSize: 14.4,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  sectionChipTextActive: {
    color: theme.colors.accent,
  },
  sectionChipIntro: {},
  sectionChipBanner: {},
  sectionChipPersonal: {},
  sectionChipRaffle: {},
  sectionChipUsersRaffle: {},
  sectionChipTextIntro: {},
  sectionChipTextBanner: {},
  sectionChipTextPersonal: {},
  sectionChipTextRaffle: {},
  sectionChipTextUsersRaffle: {},
  sectionChipActiveIntro: {
    borderColor: theme.colors.info,
    backgroundColor: theme.colors.infoSoft,
  },
  sectionChipActiveBanner: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerSurface,
  },
  sectionChipActivePersonal: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  sectionChipActiveRaffle: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  sectionChipActiveUsersRaffle: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successSurface,
  },
  sectionChipTextActiveIntro: {
    color: theme.colors.infoDeep,
  },
  sectionChipTextActiveBanner: {
    color: theme.colors.dangerText,
  },
  sectionChipTextActivePersonal: {
    color: theme.colors.actionHover,
  },
  sectionChipTextActiveRaffle: {
    color: theme.colors.accent,
  },
  sectionChipTextActiveUsersRaffle: {
    color: theme.colors.successText,
  },
  overview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7.2,
  },
  overviewTile: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 120,
    gap: 2.4,
    paddingVertical: 8.8,
    paddingHorizontal: 10.4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8.8,
    backgroundColor: theme.colors.surface,
  },
  overviewTileActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  overviewTileIntro: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.info,
  },
  overviewTileBanner: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.danger,
  },
  overviewTilePersonal: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.action,
  },
  overviewTileRaffle: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.accent,
  },
  overviewTileUsersRaffle: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.success,
  },
  overviewTileAttention: {
    borderColor: "rgba(245, 158, 11, 0.45)",
  },
  overviewLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    color: theme.colors.text,
  },
  overviewValueAttention: {
    color: theme.colors.warningText,
  },
  overviewValueMuted: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textMuted,
  },
  listActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7.2,
    alignItems: "center",
  },
  listAction: {
    paddingVertical: 4.8,
    paddingHorizontal: 10.4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  listActionText: {
    fontSize: 13.2,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  filterHint: {
    flexBasis: "100%",
    fontSize: 13.2,
    lineHeight: 18.5,
    color: theme.colors.textMuted,
  },
  section: {
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  sectionBadge: {
    minWidth: 22,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  list: {
    gap: 16,
  },
  listContentPanel: {
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 13.6,
    backgroundColor: theme.colors.surfaceMuted,
  },
  listContentPanelIntro: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.info,
    borderColor: "rgba(3, 105, 161, 0.24)",
    backgroundColor: theme.colors.infoSoft,
  },
  listContentPanelBanner: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.danger,
    borderColor: "rgba(198, 40, 40, 0.24)",
    backgroundColor: theme.colors.dangerSurface,
  },
  listContentPanelPersonal: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.action,
    borderColor: "rgba(31, 111, 235, 0.24)",
    backgroundColor: theme.colors.actionSoft,
  },
  listContentPanelRaffle: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.accent,
    borderColor: "rgba(124, 58, 237, 0.24)",
    backgroundColor: theme.colors.accentSoft,
  },
  listContentPanelUsersRaffle: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.success,
    borderColor: "rgba(22, 163, 74, 0.24)",
    backgroundColor: theme.colors.successSurface,
  },
  cardAttention: {
    borderRadius: 12,
  },
  collapsedToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
  },
  collapsedToggleAttention: {
    borderColor: "rgba(245, 158, 11, 0.45)",
    backgroundColor: theme.colors.warningSurface,
  },
  collapsedMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  collapsedTitle: {
    fontSize: 14.8,
    fontWeight: "700",
    color: theme.colors.text,
  },
  collapsedPreview: {
    fontSize: 12.8,
    fontWeight: "600",
    color: theme.colors.warningText,
  },
  collapsedMeta: {
    alignItems: "flex-end",
    gap: 2,
  },
  collapsedCreated: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
  },
  collapsedChevron: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  collapsedExpandLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  state: {
    marginBottom: 16,
    fontSize: 15.2,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  stateError: {
    color: theme.colors.danger,
  },
  empty: {
    fontSize: 15.2,
    lineHeight: 22,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 8,
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
