import type { PublicSellerOneCShelf } from "../api/sellerShelfApi";

export type OneCShelfRow = {
  level: number;
  parentName: string;
  items: PublicSellerOneCShelf[];
};

/**
 * Ряды категорий 1С по пути выбора: корни, затем дети каждой выбранной.
 * Паритет web `SellerProductsPage` onecRows.
 */
export const buildOneCShelfRows = (
  onecShelves: PublicSellerOneCShelf[],
  onecPath: string[],
): OneCShelfRow[] => {
  const rows: OneCShelfRow[] = [];
  let level = 0;
  let items = onecShelves;
  let parentName = "";

  while (items.length > 0) {
    rows.push({ level, parentName, items });
    const selectedId = onecPath[level];
    const selected = selectedId ? items.find((item) => item.id === selectedId) : null;
    if (!selected) break;
    items = Array.isArray(selected.children) ? selected.children : [];
    parentName = selected.name;
    level += 1;
  }

  return rows;
};
