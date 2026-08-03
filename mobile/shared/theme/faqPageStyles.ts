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
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  contact: {
    marginTop: theme.spacing[6],
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
}));
