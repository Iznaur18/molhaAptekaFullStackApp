import type { SearchSynonymRow } from "@/entities/product-search-synonym/api/searchSynonymAdminApi";

export const filterSynonymRows = (rows: SearchSynonymRow[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return rows;
  }
  return rows.filter((row) => {
    const token = row.token.toLowerCase();
    const cats = row.categories.join(" ").toLowerCase();
    return token.includes(q) || cats.includes(q);
  });
};

export const sortSynonymRows = (rows: SearchSynonymRow[]) =>
  [...rows].sort((a, b) => a.token.localeCompare(b.token, "ru"));
