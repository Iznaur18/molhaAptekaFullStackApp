import { Platform, StyleSheet } from "react-native";

import { izModalBackdropScrim } from "@izibuy/design-tokens";

import { CHECKOUT_FORM_INPUT_LAYOUT as CF_INPUT } from "@/features/checkout/lib/checkoutFormInputLayout";
import { CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT } from "@/entities/order/lib/checkoutPaymentMethodCardTheme";
import { AUTH_PAGE_LAYOUT as A } from "@/shared/lib/authPageLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** @deprecated import `izModalBackdropScrim` from `@izibuy/design-tokens` */
export const MODAL_BACKDROP_SCRIM = izModalBackdropScrim;

export const EMAIL_VERIFY_MODAL_CORNER_RADIUS = 36;

export const PASSWORD_TOGGLE_ICON_SIZE = A.passwordToggleSize;

/** Высота checkout bottom sheet, % viewport (было 88%, −20% → 70). */
/** Паритет web `--checkout-sheet-height: 70%` в CheckoutSheetModal.css. */
export const CHECKOUT_SHEET_HEIGHT_PERCENT = 70;

/** Канон auth — `useLoginScreenStyles` (+ AUTH_PAGE_LAYOUT). */

export const useLoginScreenStyles = createThemedStyles((theme, layout) => ({
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
    fontWeight: theme.typography.fontWeightBold,
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
    fontWeight: theme.typography.fontWeightSemibold,
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
    fontWeight: theme.typography.fontWeightMedium,
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
    fontWeight: theme.typography.fontWeightSemibold,
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
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textSecondary,
  },
  consentLink: {
    color: theme.colors.link,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  consentSummary: {
    fontSize: theme.typography.fontXs,
    lineHeight: theme.typography.leadingXs,
    color: theme.colors.textMuted,
  },
}));

export const useFormFieldStyles = createThemedStyles((theme, layout) => ({
  label: {
    fontSize: theme.typography.fontBase,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  labelStrong: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  hint: {
    marginTop: theme.spacing[1],
    fontSize: theme.typography.fontXs,
    color: theme.colors.textMuted,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    marginBottom: theme.spacing[4],
    fontSize: theme.typography.fontLg,
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
    fontSize: theme.typography.font3xl,
    letterSpacing: 4,
    textAlign: "center",
  },
  field: {
    gap: theme.spacing[1],
  },
  fieldLabel: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  error: {
    color: theme.colors.danger,
    marginBottom: theme.spacing[3],
    fontSize: theme.typography.fontBase,
  },
  errorInline: {
    marginBottom: theme.spacing[2],
  },
  success: {
    color: theme.colors.success,
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontBase,
  },
  statusOk: {
    color: theme.colors.success,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  statusPending: {
    color: theme.colors.warning,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  statusRejected: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: theme.typography.leadingLg,
  },
  switchRow: {
    marginTop: theme.spacing[5],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    flex: 1,
    fontSize: theme.typography.fontMd,
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

export const useCheckoutFormStyles = createThemedStyles((theme, layout) => ({
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
  /** web `.cart-fulfillment` card stack gap (`--cart-fulfillment-card-gap: 6px`). */
  fulfillmentCardsFields: {
    gap: 6,
  },
  /**
   * web `.cart-fulfillment__method-card` / `__payment`:
   * margin 6/12, pad 14/16, r16, elevated + ink 8% border.
   */
  fulfillmentMethodCard: {
    marginHorizontal: 12,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    borderColor: `${theme.colors.ink}14`,
    backgroundColor: theme.colors.surfaceElevated,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  /** web `.cart-fulfillment__details` — gutter only; section paints the card. */
  fulfillmentDetailsCard: {
    marginHorizontal: 12,
    marginTop: 6,
    gap: 6,
  },
  fulfillmentPaymentCard: {
    marginHorizontal: 12,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    borderColor: `${theme.colors.ink}14`,
    backgroundColor: theme.colors.surfaceElevated,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  heading: {
    fontSize: theme.typography.fontXl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  fieldGroup: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
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
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: theme.typography.leadingXs,
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
    fontSize: theme.typography.font2xs,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: 14,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  fulfillmentOptionHintActive: {
    color: "rgba(255,255,255,0.85)",
  },
  /** web cart `.checkout-form__fulfillment-section` live: pad 14/16 gap 12 r16. */
  fulfillmentSection: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 16,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  fulfillmentSectionPickup: {
    borderColor: `${theme.colors.action}2E`,
    backgroundColor: theme.colors.actionSoft,
  },
  /** web cart: delivery tint = pickup (action 5% / border 18%). */
  fulfillmentSectionDelivery: {
    borderColor: `${theme.colors.action}2E`,
    backgroundColor: theme.colors.actionSoft,
  },
  fulfillmentSectionOff: {
    opacity: 0.55,
    paddingVertical: 12,
  },
  /** web `.checkout-form__fulfillment-section-head` gap 0.35rem 0.65rem. */
  fulfillmentSectionHead: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5.6,
  },
  fulfillmentSectionBadge: {
    paddingHorizontal: 8.8,
    paddingVertical: 2.88,
    borderRadius: 999,
    fontSize: 10.88,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    overflow: "hidden",
  },
  fulfillmentSectionBadgePickup: {
    backgroundColor: theme.colors.actionSoft,
    color: theme.colors.action,
  },
  fulfillmentSectionBadgeDelivery: {
    backgroundColor: `${theme.colors.ink}17`,
    color: theme.colors.textSecondary,
  },
  fulfillmentSectionTitle: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  fulfillmentSectionBody: {
    gap: 12,
  },
  fulfillmentSplit: {
    height: 0,
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderTopColor: theme.colors.border,
    marginVertical: 2,
  },
  pickupAddressText: {
    fontSize: theme.typography.fontMd,
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.text,
  },
  pickupAddressError: {
    color: theme.colors.danger,
  },
  pickupHint: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
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
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightBold,
    color: "#fff",
    lineHeight: 14,
  },
  pickupBody: {
    flex: 1,
    gap: 2,
  },
  pickupProducts: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: theme.typography.leadingXs,
    color: theme.colors.text,
  },
  pickupGroup: {
    gap: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  pickupSelectLabel: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
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
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  legend: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
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
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
  },
  feedbackError: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontBase,
  },
  feedbackSuccess: {
    color: theme.colors.success,
    fontSize: theme.typography.fontBase,
  },
  /** web `.cart-page__checkout-cta` / `--iz-radius-button: 10px`. */
  submitSpacer: {
    alignSelf: "stretch",
    marginTop: theme.spacing[4],
    minHeight: 52,
    paddingVertical: 14,
    borderRadius: 10,
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

export const useCheckoutPaymentMethodPickerStyles = createThemedStyles(
  (theme, layout) => ({
    /** web cart `.cart-fulfillment__payment .checkout-payment-method-picker { margin-top: 0 }`. */
    root: {
      gap: 10,
      marginTop: 0,
    },
    legend: {
      fontSize: theme.typography.fontBase,
      fontWeight: theme.typography.fontWeightSemibold,
      color: theme.colors.textSecondary,
    },
    /** web `.checkout-payment-method-picker__scroll` gap 8. */
    row: {
      flexDirection: "row",
      flexWrap: "nowrap",
      gap: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.gap,
      paddingVertical: 0,
    },
    /** web `.checkout-payment-method-picker__card` live: pad 8/12 minH 52 r12. */
    card: {
      flexGrow: 0,
      flexShrink: 0,
      width: "auto",
      minWidth: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.minWidth,
      maxWidth: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.maxWidth,
      minHeight: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.minHeight,
      borderRadius: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.borderRadius,
      paddingHorizontal: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.paddingHorizontal,
      paddingVertical: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.paddingVertical,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.unselectedBorderWidth,
      backgroundColor: theme.colors.surface,
    },
    cardSelected: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.action,
      borderWidth: CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT.selectedBorderWidth,
    },
    cardLabel: {
      fontSize: theme.typography.fontSm,
      lineHeight: theme.typography.leadingXs,
      fontWeight: theme.typography.fontWeightSemibold,
      textAlign: "center",
    },
    cardLabelSelected: {
      color: theme.colors.text,
    },
    // Web: `.checkout-payment-method-picker__card--locked` — пунктир без заливки.
    cardLocked: {
      backgroundColor: "transparent",
      borderColor: theme.colors.border,
      borderStyle: "dashed",
      opacity: 0.7,
    },
    cardLockReason: {
      marginTop: 2,
      fontSize: theme.typography.font2xs,
      lineHeight: 13,
      fontWeight: theme.typography.fontWeightMedium,
      textAlign: "center",
      color: theme.colors.textMuted,
    },
    // Web: `.checkout-payment-method-picker__single` — один способ строкой.
    single: {
      alignSelf: "flex-start",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderWidth: 1.5,
      borderColor: theme.colors.action,
      borderRadius: 12,
      backgroundColor: theme.colors.actionSoft,
      color: theme.colors.text,
      fontSize: theme.typography.fontBase,
      fontWeight: theme.typography.fontWeightSemibold,
      overflow: "hidden",
    },
  }),
);

export const useAddressSuggestStyles = createThemedStyles((theme, layout) => ({
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
    fontSize: theme.typography.fontBase,
    color: theme.colors.text,
  },
  loader: {
    marginTop: theme.spacing[2],
  },
}));

export const useBottomSheetFormStyles = createThemedStyles((theme, layout) => ({
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
    fontSize: theme.typography.font2xl,
    fontWeight: theme.typography.fontWeightBold,
    flex: 1,
    color: theme.colors.text,
  },
  close: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.link,
  },
  intro: {
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
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
    fontSize: theme.typography.fontLg,
    backgroundColor: theme.colors.bg,
    color: theme.colors.text,
  },
  stepMeta: {
    gap: 4,
    marginBottom: theme.spacing[1],
  },
  stepProgress: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  stepTitle: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
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
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
  },
  fileName: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
  },
  rejectBlock: {
    paddingHorizontal: theme.spacing[4],
    gap: 6,
  },
  staffNote: {
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textMuted,
  },
  statusPadding: {
    paddingHorizontal: theme.spacing[4],
  },
  modalText: {
    fontSize: theme.typography.fontMd,
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
    fontSize: theme.typography.fontMd,
  },
  dismiss: {
    marginTop: theme.spacing[4],
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontMd,
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
    paddingHorizontal: layout.contentPaddingHorizontal,
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
    fontSize: theme.typography.font2xl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
}));

export const useAuthGateStyles = createThemedStyles((theme, layout) => ({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    backgroundColor: layout.pageBackground,
  },
  message: {
    fontSize: theme.typography.fontLg,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
}));

/** Паритет с web `CheckoutSellerDeliveryCost.css`: цена доставки по тарифу продавца. */
export const useCheckoutSellerDeliveryCostStyles = createThemedStyles(
  (theme, layout) => ({
    root: {
      gap: 6,
      marginTop: theme.spacing[2],
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceMuted,
    },
    /** web `.cart-fulfillment__dock .checkout-seller-delivery { margin-top: 4px }`. */
    rootInDock: {
      marginTop: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 12,
    },
    legend: {
      flexShrink: 1,
      fontSize: theme.typography.fontBase,
      fontWeight: theme.typography.fontWeightSemibold,
      color: theme.colors.textSecondary,
    },
    value: {
      fontSize: theme.typography.fontMd,
      fontWeight: theme.typography.fontWeightBold,
      color: theme.colors.text,
      fontVariant: ["tabular-nums"],
    },
    hint: {
      fontSize: 12.5,
      lineHeight: theme.typography.leadingXs,
      color: theme.colors.textMuted,
    },
    hintError: {
      color: theme.colors.danger,
    },
    totals: {
      gap: 4,
      marginTop: 4,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    totalRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 12,
    },
    totalRowSum: {
      marginTop: 4,
    },
    totalLabel: {
      fontSize: 13.5,
      color: theme.colors.textSecondary,
    },
    totalValue: {
      fontSize: 13.5,
      color: theme.colors.text,
      fontVariant: ["tabular-nums"],
    },
    totalSumLabel: {
      fontSize: theme.typography.fontMd,
      fontWeight: theme.typography.fontWeightBold,
      color: theme.colors.text,
    },
    totalSumValue: {
      fontSize: theme.typography.fontLg,
      fontWeight: "800",
      color: theme.colors.text,
      fontVariant: ["tabular-nums"],
    },
    attribution: {
      fontSize: theme.typography.font2xs,
      lineHeight: 14,
      color: theme.colors.textMuted,
    },
  }),
);

/** Паритет с web `CdekPickupPointPicker.css`: город, тариф, пункт, получатель. */
export const useCdekPickupPointPickerStyles = createThemedStyles((theme, layout) => ({
  root: {
    gap: 12,
    marginTop: theme.spacing[2],
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.typography.fontLg,
  },
  findButton: {
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
  },
  findButtonText: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.onContrast,
  },
  disabled: {
    opacity: 0.55,
  },
  options: {
    gap: 8,
  },
  option: {
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  optionActive: {
    borderWidth: 2,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  optionTitle: {
    fontSize: theme.typography.fontBase,
    lineHeight: 19,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  optionMeta: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.textSecondary,
  },
  price: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  hint: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.textMuted,
  },
  error: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.danger,
  },
}));
