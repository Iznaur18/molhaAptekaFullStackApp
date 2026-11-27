import { PROFILE_ACCOUNT_STACK_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** Раздел «Доставка и оплата» — паритет web `DeliveryPaymentPage.css`. */
export const useDeliveryPaymentPageStyles = createThemedStyles((theme, layout) => ({
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
  root: {
    gap: 16,
  },
  header: {
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
  intro: {
    fontSize: theme.typography.fontMd,
    lineHeight: 22.5,
    color: theme.colors.textSecondary,
  },
  status: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  statusOk: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successSurface,
  },
  statusWarn: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningSurface,
  },
  statusText: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  statusTextOk: {
    color: theme.colors.successText,
  },
  statusTextWarn: {
    color: theme.colors.warningText,
  },
  block: {
    gap: 12,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  legend: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  blockHint: {
    fontSize: theme.typography.fontSm,
    lineHeight: 18,
    color: theme.colors.textSecondary,
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
  },
  method: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  methodOn: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  methodCopy: {
    flex: 1,
    gap: 4,
  },
  methodTitle: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  methodHint: {
    fontSize: theme.typography.fontSm,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  methods: {
    gap: 8,
  },
  tariffModes: {
    flexDirection: "row",
    gap: 8,
  },
  tariffMode: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tariffModeOn: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  tariffModeText: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  tariffModeTextOn: {
    color: theme.colors.onContrast,
  },
  tariffGrid: {
    gap: 12,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  fieldHint: {
    fontSize: theme.typography.fontSm,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  error: {
    fontSize: 13.6,
    color: theme.colors.danger,
  },
  success: {
    fontSize: 13.6,
    color: theme.colors.successText,
  },
  muted: {
    fontSize: theme.typography.fontMd,
    lineHeight: 22.5,
    color: theme.colors.textSecondary,
  },
  carrierHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  carrierTitle: {
    flex: 1,
    fontSize: theme.typography.fontXl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  carrierStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  carrierStatusOn: {
    backgroundColor: theme.colors.successSurface,
  },
  carrierStatusText: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textSecondary,
  },
  facts: {
    gap: 8,
  },
  factRow: {
    gap: 2,
  },
  factLabel: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.textSecondary,
  },
  factValue: {
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
  },
  selectRow: {
    gap: 8,
  },
  selectOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  selectOptionOn: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  selectOptionText: {
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  howToList: {
    gap: 6,
    paddingLeft: 4,
  },
  howToItem: {
    fontSize: theme.typography.fontSm,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  link: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.action,
    textDecorationLine: "underline",
  },
}));
