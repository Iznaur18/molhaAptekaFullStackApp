import { StyleSheet } from "react-native";

import { MODAL_BACKDROP_SCRIM } from "@/shared/theme/formChromeStyles";
import { PROFILE_ACCOUNT_STACK_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useDataConfirmationPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: L.stackGap,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
  },
  /** Desktop hub: shell уже даёт gutter. */
  contentInAccountShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    gap: 14,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 20,
    borderRadius: 18,
    backgroundColor: theme.colors.info,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: theme.colors.onContrast,
  },
  heroInfo: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.onContrast,
    opacity: 0.8,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  benefitsCard: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  benefitIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.infoSoft,
  },
  benefitText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14.5,
    lineHeight: 20,
    paddingTop: 6,
    color: theme.colors.textSecondary,
  },
  planNote: {
    fontSize: 13,
    lineHeight: 18.5,
    color: theme.colors.textMuted,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14.4,
    lineHeight: 20.2,
  },
  statusOk: {
    borderColor: theme.colors.successSurface,
    backgroundColor: theme.colors.successSurface,
  },
  statusOkText: {
    color: theme.colors.successText,
  },
  statusPending: {
    borderColor: theme.colors.warningBorder,
    backgroundColor: theme.colors.warningSurface,
  },
  statusPendingText: {
    color: theme.colors.warningText,
  },
  statusRejected: {
    borderColor: theme.colors.dangerSurface,
    backgroundColor: theme.colors.dangerSurface,
  },
  statusRejectedText: {
    color: theme.colors.danger,
  },
  submitButton: {
    width: "100%",
    backgroundColor: theme.colors.info,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
  },
  hint: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: theme.colors.action,
  },
  loginButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 15.2,
  },
}));

/** Fullscreen dialog: fade + тап по затемнению. */
export const useDataConfirmationRequestModalStyles = createThemedStyles((theme) => ({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MODAL_BACKDROP_SCRIM,
  },
  keyboardHost: {
    flex: 1,
    width: "100%",
    maxHeight: "100%",
  },
  card: {
    flex: 1,
    width: "100%",
    maxHeight: "100%",
    borderRadius: 0,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
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
  intro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing[2],
    color: theme.colors.textMuted,
  },
  form: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[5],
    gap: 10,
  },
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
    paddingVertical: theme.spacing[3],
    gap: 6,
  },
  staffNote: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  statusPadding: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
}));
