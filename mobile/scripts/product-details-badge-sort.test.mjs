import assert from "node:assert/strict";
import test from "node:test";

// Модуль без alias-импортов — Node 24 стрипает типы и гоняет настоящую функцию.
import { sortProductDetailsBadgesByLabelLength } from "../entities/product/lib/sortProductDetailsBadgesByLabelLength.ts";

test("короткие подписи идут первыми", () => {
  const sorted = sortProductDetailsBadgesByLabelLength([
    { key: "long", label: "Очень длинный бейдж" },
    { key: "short", label: "Топ" },
    { key: "mid", label: "Аукцион" },
  ]);

  assert.deepEqual(
    sorted.map((item) => item.key),
    ["short", "mid", "long"],
  );
});

test("при равной длине порядок задаёт ключ", () => {
  const sorted = sortProductDetailsBadgesByLabelLength([
    { key: "b", label: "Топ" },
    { key: "a", label: "Топ" },
  ]);

  assert.deepEqual(
    sorted.map((item) => item.key),
    ["a", "b"],
  );
});

test("исходный массив не мутируется", () => {
  const input = [
    { key: "b", label: "Аукцион" },
    { key: "a", label: "Топ" },
  ];
  sortProductDetailsBadgesByLabelLength(input);

  assert.deepEqual(
    input.map((item) => item.key),
    ["b", "a"],
  );
});
