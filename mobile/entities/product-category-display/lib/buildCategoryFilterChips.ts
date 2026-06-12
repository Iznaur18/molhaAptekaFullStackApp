export type CategoryFilterChip = {
  slug: string;
  label: string;
  categoryId: string | null;
};

const formatSlugLabel = (slug: string): string => slug.replace(/_/g, " ");

export const buildCategoryFilterChips = (
  displays: {
    categorySlug?: string | null;
    categoryId?: string | null;
    customLabel?: string | null;
  }[],
): CategoryFilterChip[] => {
  const seen = new Set<string>();
  const chips: CategoryFilterChip[] = [];

  for (const row of displays) {
    const slug =
      typeof row.categorySlug === "string" && row.categorySlug.trim()
        ? row.categorySlug.trim()
        : null;
    if (!slug || seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    const customLabel =
      typeof row.customLabel === "string" && row.customLabel.trim()
        ? row.customLabel.trim()
        : null;
    const categoryId =
      typeof row.categoryId === "string" && row.categoryId.trim()
        ? row.categoryId.trim()
        : null;
    chips.push({
      slug,
      label: customLabel ?? formatSlugLabel(slug),
      categoryId,
    });
  }

  return chips.sort((a, b) => a.label.localeCompare(b.label, "ru"));
};
