import { StyleSheet } from "react-native";

import { MODAL_BACKDROP_SCRIM } from "@/shared/theme/formChromeStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export { MODAL_BACKDROP_SCRIM };

export const STORY_VIEWER_ACTION_SCRIM = "rgba(255,255,255,0.12)";
export const STORY_VIEWER_DELETE_SCRIM = "rgba(198,40,40,0.35)";
export const STORY_VIEWER_OVERLAY_SCRIM = "rgba(0,0,0,0.55)";
export const USER_STORY_FRAME_BORDER_RADIUS = 16;

export const useBottomSheetReportModalStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    padding: 20,
    paddingBottom: theme.spacing[8],
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  productName: {
    marginTop: 6,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  blocked: {
    marginTop: theme.spacing[4],
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  label: {
    marginTop: theme.spacing[4],
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  input: {
    marginTop: theme.spacing[2],
    minHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: theme.spacing[3],
    fontSize: 15,
    color: theme.colors.text,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  charCount: {
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: "right",
  },
  charCountError: {
    color: theme.colors.danger,
  },
  error: {
    marginTop: theme.spacing[2],
    fontSize: 13,
    color: theme.colors.danger,
  },
  actions: {
    marginTop: 20,
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.nearBlack,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
}));

export const useCreateStoryModalStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    padding: 20,
    paddingBottom: theme.spacing[8],
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[3],
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  close: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  preview: {
    height: 280,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.nearBlack,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  previewMedia: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: theme.spacing[4],
  },
  pickers: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  pickButton: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
  },
  pickDisabled: {
    opacity: 0.5,
  },
  pickText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  label: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  caption: {
    marginTop: theme.spacing[2],
    minHeight: 64,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: theme.spacing[3],
    fontSize: 15,
    color: theme.colors.text,
    textAlignVertical: "top",
  },
  error: {
    marginTop: 10,
    fontSize: 13,
    color: theme.colors.danger,
  },
  submit: {
    marginTop: theme.spacing[4],
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.nearBlack,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
}));

export const useStoryViewerModalStyles = createThemedStyles((theme) => ({
  viewer: {
    flex: 1,
    backgroundColor: theme.colors.nearBlack,
  },
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  edgePrev: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "28%",
    zIndex: 2,
  },
  edgeNext: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "28%",
    zIndex: 2,
  },
  edgeDisabled: {
    pointerEvents: "none",
  },
  frame: {
    position: "relative",
    overflow: "hidden",
    borderRadius: USER_STORY_FRAME_BORDER_RADIUS,
    backgroundColor: theme.colors.nearBlack,
    zIndex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 3,
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: STORY_VIEWER_OVERLAY_SCRIM,
  },
  closeText: {
    color: theme.colors.onContrast,
    fontSize: 24,
    lineHeight: 24,
  },
  header: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 60,
    zIndex: 3,
  },
  authorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: "100%",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    color: theme.colors.onContrast,
    fontWeight: "700",
    fontSize: 16,
  },
  authorName: {
    flexShrink: 1,
    color: theme.colors.onContrast,
    fontSize: 16,
    fontWeight: "600",
  },
  mediaLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  mediaHidden: {
    opacity: 0,
  },
  mediaState: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    backgroundColor: theme.colors.nearBlack,
  },
  mediaStateText: {
    color: theme.colors.onContrast,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
  caption: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 72,
    zIndex: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    backgroundColor: STORY_VIEWER_OVERLAY_SCRIM,
    color: theme.colors.onContrast,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
  captionNoFooter: {
    bottom: 12,
  },
  footer: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    zIndex: 3,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    backgroundColor: STORY_VIEWER_ACTION_SCRIM,
  },
  deleteButton: {
    backgroundColor: STORY_VIEWER_DELETE_SCRIM,
  },
  actionText: {
    color: theme.colors.onContrast,
    fontSize: 14,
    fontWeight: "600",
  },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  stateText: {
    color: theme.colors.onContrast,
    fontSize: 15,
    textAlign: "center",
  },
  stateError: {
    color: theme.colors.danger,
  },
}));

export const useAdminEditModalStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
    justifyContent: "flex-end",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  card: {
    maxHeight: "92%",
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    padding: 20,
    gap: theme.spacing[2],
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: theme.colors.text,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: theme.spacing[2],
    color: theme.colors.text,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: theme.spacing[3],
  },
  secondaryButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    backgroundColor: theme.colors.nearBlack,
  },
  primaryButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
  closeLink: {
    alignItems: "center",
    marginTop: theme.spacing[2],
    paddingVertical: theme.spacing[2],
  },
  closeLinkText: {
    color: theme.colors.textMuted,
  },
}));

export const useProductPromotionModalStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
    justifyContent: "flex-end",
  },
  card: {
    maxHeight: "92%",
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    padding: 20,
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  body: {
    paddingBottom: theme.spacing[2],
    gap: 10,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  balanceCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.sm,
    padding: theme.spacing[3],
    gap: 4,
  },
  balanceCardOk: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
  },
  balanceCardInsufficient: {
    backgroundColor: theme.colors.warningSurface,
    borderColor: theme.colors.danger,
  },
  balanceLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: theme.colors.textMuted,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  sectionTitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  tierGrid: {
    gap: theme.spacing[2],
  },
  tierCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.sm,
    padding: theme.spacing[3],
    gap: 4,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  tierCardSelected: {
    borderColor: theme.colors.nearBlack,
  },
  tierBadge: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    color: theme.colors.text,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  tierRate: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  tierDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  durationChip: {
    minWidth: "30%",
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 10,
    gap: 4,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  durationChipSelected: {
    borderColor: theme.colors.nearBlack,
  },
  durationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  durationPrice: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  summary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.sm,
    padding: theme.spacing[3],
    gap: theme.spacing[2],
    marginTop: 4,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing[3],
  },
  summaryLabel: {
    color: theme.colors.textMuted,
  },
  summaryValueStrong: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  summaryValueBold: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.text,
  },
  primaryButton: {
    flex: 1.4,
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    backgroundColor: theme.colors.nearBlack,
  },
  primaryButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
}));
