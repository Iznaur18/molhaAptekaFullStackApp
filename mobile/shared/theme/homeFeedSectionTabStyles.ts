import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** Паритет web `.home-feed-section-tabs` / `.home-feed-sellers`. */
export const useHomeFeedSectionTabStyles = createThemedStyles((theme) => ({
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  tabActive: {
    backgroundColor: theme.colors.actionSoft,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  tabLabelActive: {
    color: theme.colors.action,
  },
  sellers: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  searchInput: {
    width: "100%",
    minHeight: 44,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: `${theme.colors.text}12`,
  },
  empty: {
    marginTop: 6,
    color: theme.colors.text,
    opacity: 0.6,
  },
  error: {
    color: theme.colors.danger,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
}));
