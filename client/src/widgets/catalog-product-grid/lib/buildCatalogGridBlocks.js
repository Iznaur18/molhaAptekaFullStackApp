/**
 * Режет ленту на блоки по `rowsPerBlock` рядов сетки.
 *
 * Ключ блока — число колонок и порядковый номер. При догрузке страницы уже
 * показанные блоки сохраняют ключ (а с ним и DOM), дописывается только хвост.
 *
 * @template T
 * @param {T[]} items
 * @param {number} columnCount
 * @param {number} rowsPerBlock
 * @returns {{ key: string; startIndex: number; items: T[] }[]}
 */
export function buildCatalogGridBlocks(items, columnCount, rowsPerBlock) {
  const columns = Math.max(1, Math.floor(columnCount) || 1);
  const rows = Math.max(1, Math.floor(rowsPerBlock) || 1);
  const blockSize = columns * rows;

  const blocks = [];
  for (let startIndex = 0; startIndex < items.length; startIndex += blockSize) {
    blocks.push({
      key: `${columns}:${startIndex / blockSize}`,
      startIndex,
      items: items.slice(startIndex, startIndex + blockSize),
    });
  }
  return blocks;
}
