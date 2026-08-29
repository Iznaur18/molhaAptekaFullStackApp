import { Platform, StyleSheet } from "react-native";

import { CHECKOUT_FORM_INPUT_LAYOUT as CF_INPUT } from "@/features/checkout/lib/checkoutFormInputLayout";
import { CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT } from "@/entities/order/lib/checkoutPaymentMethodCardTheme";
import { AUTH_PAGE_LAYOUT as A } from "@/shared/lib/authPageLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

export const MODAL_BACKDROP_SCRIM = "rgba(0,0,0,0.45)";

export const EMAIL_VERIFY_MODAL_CORNER_RADIUS = 36;

export const PASSWORD_TOGGLE_ICON_SIZE = A.passwordToggleSize;

/** Высота checkout bottom sheet, % viewport (было 88%, −20% → 70). */
/** Паритет web `--checkout-sheet-height: 70%` в CheckoutSheetModal.css. */
export const CHECKOUT_SHEET_HEIGHT_PERCENT = 70;

export const useAuthFormStyles = createThemedStyles((theme) => ({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing[6],
    paddingTop: theme.spacing[8],
    justifyContent: "flex-start",
  },
  card: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  heroZone: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[6],
  },
  formZone: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[2],
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: theme.spacing[1],
    marginBottom: theme.spacing[2],
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.link,
  },
  actionsZone: {
    backgroundColor: theme.colors.actionSoft,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.actionBorder,
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[5],
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  subtitle: {
    marginTop: theme.spacing[1],
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.onContrast,
    opacity: 0.78,
  },
  authActions: {
    gap: theme.spacing[3],
  },
  authButton: {
    width: "100%",
  },
  authSecondaryButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
  },
  authInput: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.borderStrong,
  },
  link: {
    marginTop: theme.spacing[5],
    textAlign: "center",
    color: theme.colors.link,
    fontSize: 15,
  },
}));

export const useLoginScreenStyles = createThemedStyles((theme) => ({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  page: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingBottom: theme.spacing[8],
    overflow: "hidden",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  column: {
    position: "relative",
    width: "100%",
    maxWidth: A.columnMaxWidth,
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
  },
  hero: {
    width: "100%",
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: A.heroRadius,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroSkeleton: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.surfaceMuted,
  },
  body: {
    width: "100%",
    paddingHorizontal: A.bodyPaddingX,
    paddingTop: A.bodyPaddingTop,
    gap: A.bodyGap,
  },
  title: {
    fontSize: A.titleFontSize,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: A.subtitleFontSize,
    lineHeight: A.subtitleLineHeight,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: A.subtitleMarginBottom,
  },
  form: {
    gap: A.formGap,
  },
  backButtonOverlay: {
    position: "absolute",
    zIndex: 10,
    width: A.backSize,
    height: A.backSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: A.backRadius,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  backButtonOverlayDisabled: {
    opacity: 0.55,
  },
  field: {
    gap: A.fieldGap,
  },
  label: {
    fontSize: A.labelFontSize,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: A.inputRadius,
    paddingHorizontal: A.inputPaddingX,
    paddingVertical: A.inputPaddingY,
    fontSize: A.inputFontSize,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.text,
  },
  passwordWrap: {
    position: "relative",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: A.inputRadius,
    backgroundColor: theme.colors.surfaceMuted,
  },
  passwordWrapFocused: {
    borderColor: theme.colors.action,
  },
  passwordInput: {
    width: "100%",
    borderWidth: 0,
    paddingLeft: A.inputPaddingX,
    paddingRight: 48,
    paddingVertical: A.inputPaddingY,
    fontSize: A.inputFontSize,
    color: theme.colors.text,
    backgroundColor: "transparent",
  },
  passwordToggle: {
    position: "absolute",
    right: 6,
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  inputFocused: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.surfaceMuted,
  },
  channelRow: {
    flexDirection: "row",
    gap: A.channelGap,
  },
  channelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: A.channelBtnPaddingY,
    paddingHorizontal: A.channelBtnPaddingX,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: A.channelBtnRadius,
    backgroundColor: theme.colors.surface,
  },
  channelBtnActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  channelBtnDisabled: {
    opacity: 0.7,
  },
  channelBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  channelBtnLabel: {
    fontSize: A.channelBtnFontSize,
    fontWeight: "500",
    color: theme.colors.text,
  },
  channelBtnLabelActive: {
    color: theme.colors.onContrast,
  },
  error: {
    margin: 0,
    color: theme.colors.danger,
    fontSize: A.errorFontSize,
  },
  submitButton: {
    width: "100%",
  },
  registerLink: {
    alignSelf: "center",
    paddingVertical: 0,
  },
  registerLinkDisabled: {
    opacity: 0.55,
  },
  registerLinkText: {
    fontSize: A.linkFontSize,
    fontWeight: "600",
    color: theme.colors.link,
    textDecorationLine: "underline",
    textDecorationColor: theme.colors.link,
  },
  consentBlock: {
    gap: theme.spacing[3],
    marginTop: theme.spacing[1],
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[2],
  },
  consentTextWrap: {
    flex: 1,
    gap: theme.spacing[2],
  },
  consentText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  consentLink: {
    color: theme.colors.link,
    fontWeight: "600",
  },
  consentSummary: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textMuted,
  },
}));

export const useFormFieldStyles = createThemedStyles((theme) => ({
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  labelStrong: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  hint: {
    marginTop: theme.spacing[1],
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    marginBottom: theme.spacing[4],
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  inputCompact: {
    marginBottom: 0,
  },
  inputReadOnly: {
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textMuted,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  inputCode: {
    fontSize: 20,
    letterSpacing: 4,
    textAlign: "center",
  },
  field: {
    gap: theme.spacing[1],
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  error: {
    color: theme.colors.danger,
    marginBottom: theme.spacing[3],
    fontSize: 14,
  },
  errorInline: {
    marginBottom: theme.spacing[2],
  },
  success: {
    color: theme.colors.success,
    marginBottom: theme.spacing[2],
    fontSize: 14,
  },
  statusOk: {
    color: theme.colors.success,
    fontSize: 15,
    fontWeight: "600",
  },
  statusPending: {
    color: theme.colors.warning,
    fontSize: 15,
    fontWeight: "600",
  },
  statusRejected: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  switchRow: {
    marginTop: theme.spacing[5],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    marginRight: theme.spacing[3],
  },
  formScroll: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  submitSpacer: {
    marginTop: theme.spacing[6],
  },
}));

export const useCheckoutFormStyles = createThemedStyles((theme) => ({
  form: {
    gap: 14,
  },
  formPinned: {
    flex: 1,
    justifyContent: "space-between",
  },
  fields: {
    gap: 14,
  },
  heading: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
  },
  fieldGroup: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  fieldInput: {
    borderWidth: CF_INPUT.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: CF_INPUT.borderRadius,
    paddingHorizontal: CF_INPUT.paddingHorizontal,
    paddingVertical: CF_INPUT.paddingVertical,
    marginBottom: 0,
    fontSize: CF_INPUT.fontSize,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.text,
  },
  fulfillmentRow: {
    flexDirection: "row",
    gap: 10,
  },
  fulfillmentOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 10,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  fulfillmentOptionActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  fulfillmentOptionDisabled: {
    opacity: 0.65,
    backgroundColor: theme.colors.surfaceMuted,
  },
  fulfillmentOptionText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 17,
    color: theme.colors.text,
    textAlign: "center",
  },
  fulfillmentOptionTextActive: {
    color: theme.colors.onContrast,
  },
  fulfillmentOptionTextDisabled: {
    color: theme.colors.textMuted,
  },
  fulfillmentOptionHint: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  fulfillmentOptionHintActive: {
    color: "rgba(255,255,255,0.85)",
  },
  pickupAddressText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
  },
  pickupAddressError: {
    color: theme.colors.danger,
  },
  pickupHint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  pickupList: {
    gap: 10,
  },
  pickupItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  pickupIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.action,
  },
  pickupIndexText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 14,
  },
  pickupBody: {
    flex: 1,
    gap: 2,
  },
  pickupProducts: {
    fontSize: 13,
    lineHeight: 17,
    color: theme.colors.link,
  },
  pickupGroup: {
    gap: 8,
    marginBottom: 12,
  },
  pickupSelectLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  pickupOptions: {
    gap: 8,
  },
  pickupOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  pickupOptionActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  pickupOptionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  legend: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginTop: theme.spacing[2],
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 44,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
  },
  radioChecked: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  radioLabel: {
    fontSize: 15,
    color: theme.colors.text,
  },
  feedbackError: {
    color: theme.colors.danger,
    fontSize: 14,
  },
  feedbackSuccess: {
    color: theme.colors.success,
    fontSize: 14,
  },
  submitSpacer: {
    alignSelf: "stretch",
    marginTop: theme.spacing[4],
    minHeight: 52,
    paddingVertical: 14,
    borderRadius: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.borderRadius,
    shadowColor: theme.colors.action,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  submitDocked: {
    marginTop: 0,
  },
}));

export const useCheckoutPaymentMethodPickerStyles = createThemedStyles((theme) => ({
  root: {
    gap: 10,
    marginTop: theme.spacing[2],
  },
  legend: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.gap,
  },
  card: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.minWidth,
    minHeight: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.minHeight,
    borderRadius: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.borderRadius,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.unselectedBorderWidth,
  },
  cardSelected: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.action,
    borderWidth: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.selectedBorderWidth,
  },
  cardLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  cardLabelSelected: {
    color: theme.colors.text,
  },
}));

export const useAddressSuggestStyles = createThemedStyles((theme) => ({
  wrap: {
    marginBottom: theme.spacing[4],
  },
  suggestions: {
    maxHeight: 160,
    marginTop: theme.spacing[2],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
  },
  suggestionRow: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  loader: {
    marginTop: theme.spacing[2],
  },
}));

export const useBottomSheetFormStyles = createThemedStyles((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: "92%",
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    paddingBottom: theme.spacing[6],
    backgroundColor: theme.colors.surface,
  },
  checkoutSheet: {
    height: `${CHECKOUT_SHEET_HEIGHT_PERCENT}%`,
    maxHeight: `${CHECKOUT_SHEET_HEIGHT_PERCENT}%`,
    paddingBottom: 0,
    /* Паритет web/raffle sheet: 2rem top radius (squircle на web) */
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  checkoutScroll: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
  },
  checkoutForm: {
    flexGrow: 1,
    gap: 16,
    paddingTop: theme.spacing[3],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    color: theme.colors.text,
  },
  close: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.link,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing[2],
    color: theme.colors.textMuted,
  },
  form: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[6],
    gap: 10,
  },
  /** Контраст к фону sheet (surface): фон = bg страницы, бордер сильнее. */
  passportInput: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: theme.colors.bg,
    color: theme.colors.text,
  },
  stepMeta: {
    gap: 4,
    marginBottom: theme.spacing[1],
  },
  stepProgress: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  stepActions: {
    flexDirection: "row",
    gap: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
  stepActionFlex: {
    flex: 1,
  },
  keyboardAvoid: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  selfieSection: {
    gap: theme.spacing[2],
    marginTop: theme.spacing[1],
  },
  selfieHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
  },
  fileName: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  rejectBlock: {
    paddingHorizontal: theme.spacing[4],
    gap: 6,
  },
  staffNote: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  statusPadding: {
    paddingHorizontal: theme.spacing[4],
  },
  modalText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[4],
  },
  secondaryAction: {
    marginTop: theme.spacing[3],
    alignItems: "center",
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: theme.colors.link,
    fontSize: 15,
  },
  dismiss: {
    marginTop: theme.spacing[4],
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: 15,
  },
  sheetPadding: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
  emailVerifyRoot: {
    flex: 1,
  },
  emailVerifySheetHost: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
  },
  emailVerifySheetAnimated: {
    width: "100%",
  },
  emailVerifyBackdropLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  emailVerifyCard: {
    width: "100%",
    backgroundColor: theme.colors.surface,
  },
  emailVerifyCardContent: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
  emailVerifyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
}));

export const useAuthGateStyles = createThemedStyles((theme) => ({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    backgroundColor: theme.colors.bg,
  },
  message: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
}));
