import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useProductReportsPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
    gap: 12,
  },
  header: {
    marginBottom: 4,
    gap: 12,
  },
  toolbar: {
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${theme.colors.danger}47`,
    backgroundColor: theme.colors.surface,
  },
  toolbarHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  toolbarCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.danger,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.onContrast,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  list: {
    gap: 8,
  },
  state: {
    fontSize: 15.2,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  stateError: {
    color: theme.colors.danger,
  },
  empty: {
    fontSize: 15.2,
    lineHeight: 22,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
  },
}));
