import { StyleSheet, Platform } from "react-native";

import { USER_STORY_FRAME_ASPECT_RATIO } from "@/entities/user-story/lib/computeUserStoryFrameSize";
import { MODAL_BACKDROP_SCRIM } from "@/shared/theme/formChromeStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { semanticColors } from "@/shared/theme/semanticColors";

export { MODAL_BACKDROP_SCRIM };

export const STORY_VIEWER_ACTION_SCRIM = "rgba(255,255,255,0.12)";
export const STORY_VIEWER_DELETE_SCRIM = "rgba(198,40,40,0.35)";
export const STORY_VIEWER_OVERLAY_SCRIM = "rgba(0,0,0,0.55)";
export const USER_STORY_FRAME_BORDER_RADIUS = 16;

export const CREATE_STORY_MODAL_ANIMATION = {
  enterMs: 300,
  exitMs: 240,
  sheetSlideDistance: 420,
  maxHeightRatio: 0.92,
} as const;

/** Зазор между полем подписи и sticky-footer «Опубликовать». */
export const CREATE_STORY_CAPTION_SUBMIT_GAP_MULTIPLIER = 4.2;

/** minHeight 48 + paddingVertical 28 + footer paddingTop/Bottom 16+32 */
export const CREATE_STORY_SUBMIT_FOOTER_HEIGHT_PX = 124;

export const REPORT_PRODUCT_MODAL_ANIMATION = {
  enterMs: 280,
  exitMs: 220,
  sheetSlideDistance: 360,
  sheetRestOffsetRatio: 0.4,
} as const;

export const EMAIL_VERIFY_MODAL_ANIMATION = REPORT_PRODUCT_MODAL_ANIMATION;

export const ADMIN_EDIT_MODAL_ANIMATION = {
  enterMs: 280,
  exitMs: 220,
  sheetSlideDistance: 360,
} as const;

/** Checkout sheet ~70% высоты — слайд на полный экран, иначе sheet торчит при старте. */
export const CHECKOUT_SHEET_MODAL_ANIMATION = {
  enterMs: 280,
  exitMs: 220,
} as const;

export const useBottomSheetReportModalStyles = createThemedStyles((theme) => ({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MODAL_BACKDROP_SCRIM,
  },
  overlay: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginHorizontal: theme.spacing[4],
    padding: 20,
    paddingBottom: theme.spacing[8],
    overflow: "hidden",
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
    color: theme.colors.action,
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
    backgroundColor: theme.colors.surfaceMuted,
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
    backgroundColor: theme.colors.danger,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.action,
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
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MODAL_BACKDROP_SCRIM,
  },
  card: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    maxHeight: "92%",
  },
  bodyScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  bodyScrollContent: {
    flexGrow: 1,
  },
  captionBlock: {
    marginTop: theme.spacing[3],
  },
  submitSpacer: {
    minHeight:
      theme.spacing[4] * CREATE_STORY_CAPTION_SUBMIT_GAP_MULTIPLIER +
      theme.spacing[8] +
      theme.spacing[4] -
      theme.spacing[3],
  },
  submitFooter: {
    flexShrink: 0,
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[8],
    backgroundColor: theme.colors.surface,
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
    alignSelf: "center",
    width: "100%",
    aspectRatio: USER_STORY_FRAME_ASPECT_RATIO,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.nearBlack,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  previewMedia: {
    ...StyleSheet.absoluteFillObject,
  },
  previewBlur: {
    transform: [{ scale: 1.16 }],
  },
  placeholder: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: theme.spacing[4],
  },
  pickDisabled: {
    opacity: 0.5,
  },
  label: {
    marginTop: theme.spacing[2],
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  caption: {
    marginTop: theme.spacing[4],
    minHeight: 192,
    height: 192,
    maxHeight: 192,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing[3],
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.text,
    textAlignVertical: "top",
  },
  error: {
    marginTop: 10,
    fontSize: 13,
    color: theme.colors.danger,
  },
  submit: {
    marginTop: 0,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.action,
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
    overflow: "hidden",
    backgroundColor: theme.colors.nearBlack,
  },
  stage: {
    flex: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  edgePrev: {
    position: "absolute",
    left: 0,
    top: 64,
    bottom: 80,
    width: "28%",
    zIndex: 1,
  },
  edgeNext: {
    position: "absolute",
    right: 0,
    top: 64,
    bottom: 80,
    width: "28%",
    zIndex: 1,
  },
  edgeDisabled: {
    pointerEvents: "none",
  },
  frame: {
    position: "relative",
    overflow: "hidden",
    borderRadius: USER_STORY_FRAME_BORDER_RADIUS,
    backgroundColor: theme.colors.nearBlack,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 5,
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: STORY_VIEWER_OVERLAY_SCRIM,
  },
  closeButtonViewer: {
    top: 12,
    right: 12,
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
    zIndex: 4,
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
    zIndex: 0,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  mediaBlur: {
    transform: [{ scale: 1.16 }],
  },
  mediaUnderlay: {
    zIndex: 1,
  },
  mediaActive: {
    zIndex: 2,
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
    zIndex: 4,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    backgroundColor: STORY_VIEWER_ACTION_SCRIM,
    zIndex: 4,
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
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MODAL_BACKDROP_SCRIM,
  },
  sheet: {
    maxHeight: "92%",
  },
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
    backgroundColor: theme.colors.action,
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

export const useModalSectionTabsStyles = createThemedStyles((theme) => ({
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: theme.spacing[2],
    paddingVertical: 2,
  },
  rowInHeader: {
    paddingTop: 6,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tabActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  tabPressed: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.action,
  },
  tabLabelActive: {
    color: theme.colors.onContrast,
  },
  segmentTrack: {
    flexDirection: "row",
    width: "100%",
    padding: 4,
    gap: 4,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  segmentTab: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 11,
  },
  segmentTabActive: {
    backgroundColor: theme.colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  segmentTabPressed: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  segmentTabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  segmentTabLabelActive: {
    color: theme.colors.text,
  },
}));

export const useProductManageToggleRowStyles = createThemedStyles((theme) => ({
  row: {
    width: "100%",
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.actionBorder,
    borderRadius: 12,
    backgroundColor: theme.colors.actionSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowPressed: {
    opacity: 0.92,
    backgroundColor: theme.colors.actionBorder,
  },
  rowDisabled: {},
  rowPending: {
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.actionSoft,
  },
  pendingLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.action,
    textAlign: "center",
  },
  rowDanger: {
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.actionSoft,
  },
  textBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  textPressable: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    color: theme.colors.action,
  },
  titleDanger: {
    color: theme.colors.action,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    color: `${theme.colors.action}B3`,
  },
  descriptionDanger: {
    color: `${theme.colors.action}B3`,
  },
}));

export const useProductEditManageSectionStyles = createThemedStyles((theme) => ({
  root: {
    gap: 12,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${semanticColors.warning}55`,
    backgroundColor: semanticColors.warningSurface,
  },
  warningBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: semanticColors.warningText,
    fontWeight: "600",
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.dangerSurface,
    overflow: "hidden",
  },
  toggles: {
    gap: 8,
  },
  deleteBlock: {
    gap: 8,
  },
  deleteBtn: {
    gap: 3.2,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerSurface,
  },
  deleteBtnDisabled: {
    opacity: 0.55,
  },
  deleteBtnTitle: {
    fontSize: 15,
    // В вебе здесь `font-weight: 650`. RN такого значения не знает, а CSS при
    // подборе начертания для веса > 500 берёт ближайшее не меньшее — то есть
    // фактически рисует 700. Ставим 700, чтобы совпало по картинке.
    // Из-за невалидного "650" весь объект стилей терял тип и ломал 21 обращение
    // к styles.* в ProductEditManageSection.
    fontWeight: "700",
    lineHeight: 20,
    color: theme.colors.danger,
  },
  deleteBtnHint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.danger,
    opacity: 0.9,
  },
  deletePending: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },
  deleteConfirm: {
    gap: 8,
  },
  deleteConfirmQuestion: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },
  deleteConfirmActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  deleteConfirmYes: {
    paddingVertical: 8.8,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    backgroundColor: theme.colors.danger,
  },
  deleteConfirmCancel: {
    paddingVertical: 8.8,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  deleteConfirmPressed: {
    opacity: 0.85,
  },
  deleteConfirmYesText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  deleteConfirmCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
}));

export const useProductPromotionModalStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
    justifyContent: "flex-end",
    ...Platform.select({
      web: {
        position: "relative",
        zIndex: 1,
      },
      default: {},
    }),
  },
  card: {
    height: "92%",
    flexDirection: "column",
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 14,
    backgroundColor: theme.colors.surface,
    ...Platform.select({
      web: {
        position: "relative",
        zIndex: 2,
      },
      default: {},
    }),
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: theme.colors.text,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  closeCircleButton: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  closeCircleButtonPressed: {
    opacity: 0.85,
    backgroundColor: theme.colors.surfaceElevated,
  },
  headerAddon: {
    marginTop: -2,
  },
  bodyScroll: {
    flex: 1,
    minHeight: 0,
  },
  body: {
    paddingBottom: 12,
    gap: 18,
  },
  overviewCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  overviewCardOk: {
    backgroundColor: theme.colors.successSurface,
    borderColor: `${semanticColors.success}40`,
  },
  overviewCardInsufficient: {
    backgroundColor: theme.colors.dangerSurface,
    borderColor: `${semanticColors.danger}40`,
  },
  overviewProductLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  overviewProductName: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    color: theme.colors.text,
  },
  overviewDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.borderStrong,
    opacity: 0.7,
  },
  overviewBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  balanceLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  balanceValue: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 2,
  },
  tierGrid: {
    gap: 10,
  },
  tierCard: {
    position: "relative",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingRight: 40,
    gap: 4,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  tierCheck: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  tierBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    overflow: "hidden",
  },
  tierTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  tierRate: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  tierDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  planCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  durationChip: {
    minWidth: "30%",
    flexGrow: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 3,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  durationTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  durationPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.link,
  },
  planDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.borderStrong,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  summaryValueStrong: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: "700",
    textAlign: "right",
  },
  summaryTotalRow: {
    marginTop: 2,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderStrong,
  },
  summaryValueBold: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "700",
  },
  summaryTotalValue: {
    fontSize: 17,
    color: theme.colors.link,
    fontWeight: "700",
    textAlign: "right",
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.dangerSurface,
    borderColor: `${semanticColors.danger}40`,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexShrink: 0,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: "700",
    fontSize: 15,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.danger,
  },
  cancelButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "700",
    fontSize: 15,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.action,
    borderColor: theme.colors.action,
    shadowColor: theme.colors.action,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonFull: {
    width: "100%",
    flex: undefined,
  },
  primaryButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "700",
    fontSize: 15,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
}));

export const useAccountRequirementModalStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: theme.radius.md,
    padding: 20,
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    maxHeight: "90%",
  },
  scrollContent: {
    gap: theme.spacing[2],
    alignItems: "center",
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing[1],
  },
  badgePremium: {
    backgroundColor: theme.colors.warningSurface,
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
  },
  badgeConfirm: {
    backgroundColor: theme.colors.successSurface,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  badgeIconPremium: {
    color: theme.colors.warningText,
  },
  badgeIconConfirm: {
    color: theme.colors.successText,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  intro: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  benefitsTitle: {
    alignSelf: "stretch",
    marginTop: theme.spacing[2],
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: theme.colors.textSecondary,
  },
  benefits: {
    alignSelf: "stretch",
    gap: theme.spacing[2],
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[2],
  },
  benefitIcon: {
    marginTop: 2,
    color: theme.colors.success,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    color: theme.colors.text,
  },
  actions: {
    gap: theme.spacing[2],
    marginTop: theme.spacing[1],
  },
  ctaPremium: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.warning,
    alignItems: "center",
  },
  ctaConfirm: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.success,
    alignItems: "center",
  },
  ctaText: {
    color: theme.colors.onContrast,
    fontWeight: "700",
    fontSize: 15,
  },
  closeButton: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  closeButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
}));

export const useSellerProductsLimitModalStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: theme.radius.md,
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
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.colors.nearBlack,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 15,
  },
}));

export const useInstallmentPassportShareConsentModalStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: theme.radius.md,
    padding: 20,
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    maxHeight: "90%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  bodyScroll: {
    maxHeight: 280,
  },
  bodyScrollContent: {
    gap: theme.spacing[2],
    paddingBottom: theme.spacing[1],
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: theme.spacing[2],
  },
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    flexShrink: 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.colors.nearBlack,
  },
  confirmButtonText: {
    /* Dark: onContrast тёмный (для серебряных action-кнопок) — на ink-кнопке нужен белый. */
    color: theme.colors.onContrast === "#12151b" ? "#ffffff" : theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  disabled: {
    opacity: 0.65,
  },
}));
