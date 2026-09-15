/**
 * Режет ленту на блоки по `rowsPerBlock` рядов сетки.
 *
 * Считает настоящие ряды: карточка во всю ширину (баннер tier-3) занимает
 * отдельный ряд и закрывает недозаполненный ряд перед собой — так же, как
 * раскладывает CSS-grid. Блок заканчивается только на границе ряда.
 *
 * Ключ блока — префикс, число колонок и порядковый номер. При догрузке
 * страницы уже показанные блоки сохраняют ключ (а с ним и DOM), дописывается
 * только хвост.
 *
 * @template T
 * @param {T[]} items
 * @param {number} columnCount
 * @param {number} rowsPerBlock
 * @param {{ isFullWidth?: (item: T) => boolean; keyPrefix?: string }} [options]
 * @returns {{ key: string; startIndex: number; items: T[] }[]}
 */
export function buildCatalogGridBlocks(
  items,
  columnCount,
  rowsPerBlock,
  { isFullWidth, keyPrefix = "" } = {},
) {
  const columns = Math.max(1, Math.floor(columnCount) || 1);
  const rows = Math.max(1, Math.floor(rowsPerBlock) || 1);

  /** @type {{ key: string; startIndex: number; items: T[] }[]} */
  const blocks = [];
  /** @type {T[]} */
  let current = [];
  let startIndex = 0;
  let rowsInBlock = 0;
  let cellsInRow = 0;

  const pushBlock = () => {
    blocks.push({
      key: `${keyPrefix}${columns}:${blocks.length}`,
      startIndex,
      items: current,
    });
  };

  /** @param {number} nextIndex */
  const closeBlockIfFull = (nextIndex) => {
    if (rowsInBlock < rows) {
      return;
    }
    pushBlock();
    current = [];
    startIndex = nextIndex;
    rowsInBlock = 0;
  };

  items.forEach((item, index) => {
    if (isFullWidth?.(item)) {
      if (cellsInRow > 0) {
        rowsInBlock += 1;
        cellsInRow = 0;
        closeBlockIfFull(index);
      }
      current.push(item);
      rowsInBlock += 1;
      closeBlockIfFull(index + 1);
      return;
    }

    current.push(item);
    cellsInRow += 1;
    if (cellsInRow === columns) {
      rowsInBlock += 1;
      cellsInRow = 0;
      closeBlockIfFull(index + 1);
    }
  });

  if (current.length > 0) {
    pushBlock();
  }
  return blocks;
}
