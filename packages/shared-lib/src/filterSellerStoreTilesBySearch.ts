export type SellerStoreSearchTile = {
  labelRu: string;
};

const normalizeSellerSearchText = (value: string): string =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е");

/** Паритет web-поиска витрин: подстрока `labelRu`, без учёта регистра и «ё». */
export const filterSellerStoreTilesBySearch = <T extends SellerStoreSearchTile>(
  tiles: readonly T[],
  searchTerm: string,
): T[] => {
  const term = normalizeSellerSearchText(searchTerm);
  if (!term) {
    return [...tiles];
  }
  return tiles.filter((tile) => normalizeSellerSearchText(tile.labelRu).includes(term));
};
