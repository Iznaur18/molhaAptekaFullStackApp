import { expect, test } from "vitest";

import { buildCatalogGridBlocks } from "./buildCatalogGridBlocks.js";

/** @param {number} count */
const range = (count) => Array.from({ length: count }, (_, index) => index);

test("режет ленту на блоки по рядам сетки", () => {
  const blocks = buildCatalogGridBlocks(range(19), 2, 4);

  expect(blocks.map((block) => block.key)).toEqual(["2:0", "2:1", "2:2"]);
  expect(blocks.map((block) => block.items.length)).toEqual([8, 8, 3]);
  expect(blocks[1].startIndex).toBe(8);
});

test("догрузка страницы сохраняет ключи уже показанных блоков", () => {
  const firstPage = buildCatalogGridBlocks(range(24), 2, 4);
  const twoPages = buildCatalogGridBlocks(range(48), 2, 4);

  expect(twoPages).toHaveLength(6);
  expect(twoPages.slice(0, firstPage.length).map((block) => block.key)).toEqual(
    firstPage.map((block) => block.key),
  );
});

test("баннер во всю ширину занимает свой ряд и закрывает неполный ряд перед собой", () => {
  const items = ["a", "b", "c", "BANNER", "d", "e", "f", "g"];

  const blocks = buildCatalogGridBlocks(items, 2, 2, {
    isFullWidth: (item) => item === "BANNER",
  });

  expect(blocks.map((block) => block.items)).toEqual([
    ["a", "b", "c"],
    ["BANNER", "d", "e"],
    ["f", "g"],
  ]);
  expect(blocks.map((block) => block.startIndex)).toEqual([0, 3, 6]);
});

test("префикс ключа разводит две ленты на одной странице", () => {
  expect(buildCatalogGridBlocks([1, 2], 2, 4, { keyPrefix: "region-" })[0].key).toBe(
    "region-2:0",
  );
});

test("пустая лента и некорректные размеры", () => {
  expect(buildCatalogGridBlocks([], 2, 4)).toEqual([]);
  expect(buildCatalogGridBlocks([1, 2, 3], 0, 0).map((block) => block.items)).toEqual([
    [1],
    [2],
    [3],
  ]);
});
