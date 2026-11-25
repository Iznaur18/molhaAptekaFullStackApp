import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useFaqPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
    backgroundColor: layout.pageBackground,
  },
  title: {
    fontSize: theme.typography.font4xl,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing[2],
    color: theme.colors.text,
  },
  meta: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing[4],
  },
  sections: {
    gap: theme.spacing[5],
  },
  section: {
    gap: theme.spacing[2],
  },
  sectionTitle: {
    fontSize: theme.typography.fontXl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  list: {
    gap: theme.spacing[2],
  },
  item: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  itemExpanded: {
    borderColor: theme.colors.action,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  questionText: {
    flex: 1,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
    lineHeight: 21,
  },
  answer: {
    fontSize: theme.typography.fontMd,
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.textSecondary,
  },
  answerBlock: {
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  linkButton: {
    alignSelf: "flex-start",
    marginTop: theme.spacing[1],
    paddingVertical: theme.spacing[1],
  },
  linkButtonText: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.action,
    textDecorationLine: "underline",
  },
  linkAdmin: {
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
  },
  linkAdminLabel: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  linkAdminHint: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.textMuted,
  },
  linkAdminInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    fontSize: theme.typography.fontBase,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  linkAdminActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  linkAdminSave: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.action,
  },
  linkAdminSaveText: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.onContrast,
  },
  linkAdminClear: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  linkAdminClearText: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  linkAdminButtonDisabled: {
    opacity: 0.6,
  },
  linkAdminError: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.danger,
  },
  linkAdminNotice: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.success,
  },
  contact: {
    marginTop: theme.spacing[6],
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textSecondary,
  },
}));
