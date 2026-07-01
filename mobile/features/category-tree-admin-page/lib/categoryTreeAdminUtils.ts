export const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isValidCategorySlug = (slug: string): boolean => CATEGORY_SLUG_PATTERN.test(slug);

export const formatCategoryPath = (row: {
  pathLabelRu?: string[];
  labelRu?: string;
}): string => {
  const path = Array.isArray(row.pathLabelRu) ? row.pathLabelRu.filter(Boolean) : [];
  if (path.length > 0) {
    return path.join(" › ");
  }
  return row.labelRu ?? "";
};

export const parseKeywordsCsv = (raw: string): string[] =>
  raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const sortCategoryRows = <T extends { pathSlugs: string[] }>(rows: T[]): T[] =>
  [...rows].sort((a, b) => a.pathSlugs.join("/").localeCompare(b.pathSlugs.join("/")));

export const filterCategoryRows = <T extends {
  slug: string;
  labelRu: string;
  pathLabelRu?: string[];
  searchKeywords?: string[];
}>(
  rows: T[],
  query: string,
): T[] => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return rows;
  }
  return rows.filter((row) => {
    const haystack = [
      row.slug,
      row.labelRu,
      formatCategoryPath(row),
      ...(row.searchKeywords ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
};

export const isCategoryStructureChanged = (
  row: { slug: string; labelRu: string; parentId: string | null },
  draft: Record<string, string | boolean>,
): boolean =>
  String(draft.slug ?? "") !== row.slug ||
  String(draft.labelRu ?? "") !== row.labelRu ||
  String(draft.parentId ?? "") !== String(row.parentId ?? "");

export const findAnyLeafForReassign = <
  T extends {
    _id: string;
    parentId: string | null;
    isLeaf: boolean;
    sortOrder: number;
    labelRu: string;
  },
>(
  row: T,
  rows: T[],
): T | null => {
  if (row.isLeaf !== true) {
    return null;
  }

  const siblings = rows.filter(
    (item) =>
      item._id !== row._id && item.parentId === row.parentId && item.isLeaf === true,
  );
  if (siblings.length > 0) {
    return [...siblings].sort(
      (a, b) =>
        (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
        String(a.labelRu).localeCompare(String(b.labelRu), "ru"),
    )[0];
  }

  const otherLeaves = rows.filter((item) => item._id !== row._id && item.isLeaf === true);
  if (otherLeaves.length === 0) {
    return null;
  }
  return [...otherLeaves].sort(
    (a, b) =>
      (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
      String(a.labelRu).localeCompare(String(b.labelRu), "ru"),
  )[0];
};

export const formatCategoryLegacyDetachLabel = (row: {
  pathLabelRu?: string[];
  labelRu?: string;
}): string => {
  const path = Array.isArray(row.pathLabelRu) ? row.pathLabelRu.filter(Boolean) : [];
  return path[0] ?? row.labelRu ?? "корневую категорию";
};

export const CATEGORY_TREE_INDENT_MAX_DEPTH = 6;
export const CATEGORY_TREE_INDENT_PX = 10;

export const resolveCategoryTreeCardIndent = (depth: number): number =>
  Math.min(depth, CATEGORY_TREE_INDENT_MAX_DEPTH) * CATEGORY_TREE_INDENT_PX;
