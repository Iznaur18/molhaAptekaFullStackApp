import { izShadows } from "@izibuy/design-tokens";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** Паритет web `.home-feed-section-tabs` / `.home-feed-sellers` / SearchInput.css. */
export const useHomeFeedSectionTabStyles = createThemedStyles((theme) => ({
  row: {
    flexDirection: "row",
    /** Web `.home-feed-section-tabs { gap: 0.6rem }` */
    gap: 9.6,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    /** Web `.home-feed-section-tab { padding: 0.5rem 1rem }` */
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  tabActive: {
    backgroundColor: theme.colors.actionSoft,
  },
  tabLabel: {
    /** Web `.home-feed-section-tabs { font-size: 0.95rem }` */
    fontSize: 15.2,
    fontWeight: "600",
    // Web `.home-feed-section-tab` → `--iz-color-text-secondary`
    color: theme.colors.textSecondary,
  },
  tabLabelActive: {
    color: theme.colors.action,
  },
  sellers: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  /** Web `.search-input__field`: pad 0.55rem/0.85rem, font 0.95rem; без minHeight 44. */
  searchInput: {
    width: "100%",
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: 13.6,
    paddingRight: 13.6,
    paddingVertical: 8.8,
    fontSize: 15.2,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  searchInputFocused: {
    borderColor: theme.colors.action,
    shadowColor: theme.colors.action,
    ...izShadows.inputFocus,
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
