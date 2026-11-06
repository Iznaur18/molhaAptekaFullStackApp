import { PROFILE_ACCOUNT_STACK_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

/** Раздел «Безопасная сделка» — паритет web `SafeDealPage.css`. */
export const useSafeDealPageStyles = createThemedStyles((theme) => ({
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
  contentInAccountShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
  },
  root: {
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  statusPending: {
    backgroundColor: theme.colors.warningSurface,
  },
  statusApproved: {
    backgroundColor: theme.colors.successSurface,
  },
  statusRejected: {
    backgroundColor: theme.colors.dangerSurface,
  },
  statusText: {
    fontSize: 12.8,
    fontWeight: "600",
    color: theme.colors.text,
  },
  card: {
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  text: {
    fontSize: 14.4,
    lineHeight: 20,
    color: theme.colors.text,
  },
  muted: {
    fontSize: 13.6,
    lineHeight: 19,
    color: theme.colors.textMuted,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
  },
  bullet: {
    fontSize: 14.4,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  approved: {
    fontSize: 14,
    lineHeight: 19,
    color: theme.colors.successText,
  },
  rejection: {
    fontSize: 14,
    lineHeight: 19,
    color: theme.colors.danger,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  segment: {
    flexDirection: "row",
    gap: 8,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  segmentItemActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  segmentItemDisabled: {
    opacity: 0.55,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  segmentTextActive: {
    color: theme.colors.onContrast,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    fontVariant: ["tabular-nums"],
  },
  inputInvalid: {
    borderColor: theme.colors.danger,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  hintError: {
    color: theme.colors.danger,
  },
  error: {
    fontSize: 13.6,
    color: theme.colors.danger,
  },
}));
