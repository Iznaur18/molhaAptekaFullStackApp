import { PROFILE_ACCOUNT_STACK_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** Раздел «Безопасная сделка» — паритет web `SafeDealPage.css`. */
export const useSafeDealPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: layout.pageBackground,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: L.stackGap,
    paddingHorizontal: layout.contentPaddingHorizontal,
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
    paddingHorizontal: layout.contentPaddingHorizontal,
    backgroundColor: layout.pageBackground,
  },
  /** web `.safe-deal-page { gap: 1rem }` */
  root: {
    gap: 16,
  },
  /** web `__header` pad 1.125×1rem, r 1.125rem */
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.typography.font4xl,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: -0.32,
    color: theme.colors.text,
  },
  status: {
    paddingVertical: 4.5,
    paddingHorizontal: 11.2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: 0.24,
    textTransform: "uppercase",
    color: theme.colors.textSecondary,
  },
  /** web `__form` pad/r 1.125rem, gap 1rem */
  card: {
    gap: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  text: {
    fontSize: theme.typography.fontMd,
    lineHeight: 22.5,
    color: theme.colors.text,
  },
  muted: {
    fontSize: theme.typography.fontMd,
    lineHeight: 22.5,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
  },
  bullet: {
    fontSize: theme.typography.fontBase,
    lineHeight: 20.3,
    color: theme.colors.textSecondary,
  },
  approved: {
    fontSize: theme.typography.fontBase,
    lineHeight: 20.3,
    color: theme.colors.successText,
  },
  rejection: {
    fontSize: theme.typography.fontBase,
    lineHeight: 20.3,
    color: theme.colors.dangerText,
  },
  field: {
    gap: 5.6,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
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
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
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
    fontSize: theme.typography.fontLg,
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
