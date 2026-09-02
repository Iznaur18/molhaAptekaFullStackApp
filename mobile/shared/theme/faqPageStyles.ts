import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useFaqPageStyles = createThemedStyles((theme) => ({
  container: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: theme.spacing[2],
    color: theme.colors.text,
  },
  meta: {
    fontSize: 13,
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
    fontSize: 17,
    fontWeight: "700",
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
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    lineHeight: 21,
  },
  answer: {
    fontSize: 15,
    lineHeight: 22,
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
    fontSize: 15,
    fontWeight: "700",
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
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  linkAdminHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  linkAdminInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    fontSize: 14,
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
    fontSize: 13,
    fontWeight: "600",
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
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  linkAdminButtonDisabled: {
    opacity: 0.6,
  },
  linkAdminError: {
    fontSize: 13,
    color: theme.colors.danger,
  },
  linkAdminNotice: {
    fontSize: 13,
    color: theme.colors.success,
  },
  contact: {
    marginTop: theme.spacing[6],
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
}));
