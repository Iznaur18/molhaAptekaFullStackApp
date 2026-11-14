function normalizeSellerSearchText(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е");
}

/**
 * @param {Array<{ labelRu: string }>} tiles
 * @param {string} searchTerm
 */
export function filterSellerStoreTilesBySearch(tiles, searchTerm) {
  const term = normalizeSellerSearchText(searchTerm);
  if (!term) {
    return tiles;
  }
  return tiles.filter((tile) =>
    normalizeSellerSearchText(tile.labelRu).includes(term),
  );
}