import assert from "node:assert/strict";
import test from "node:test";

import {
  formatProductDescriptionPlainText,
  parseProductDescriptionBlocks,
  toggleProductDescriptionH1,
} from "../dist/productDescriptionMarkup.js";

test("parseProductDescriptionBlocks: H1 and paragraphs", () => {
  const blocks = parseProductDescriptionBlocks(
    "# Заголовок\nТекст абзаца\nвторая строка\n# Ещё\nхвост",
  );
  assert.deepEqual(blocks, [
    { type: "h1", text: "Заголовок" },
    { type: "paragraph", text: "Текст абзаца\nвторая строка" },
    { type: "h1", text: "Ещё" },
    { type: "paragraph", text: "хвост" },
  ]);
});

test("parseProductDescriptionBlocks: plain text unchanged as paragraph", () => {
  assert.deepEqual(parseProductDescriptionBlocks("просто текст"), [
    { type: "paragraph", text: "просто текст" },
  ]);
});

test("formatProductDescriptionPlainText strips # markers", () => {
  assert.equal(
    formatProductDescriptionPlainText("# Заголовок\nтело"),
    "Заголовок\nтело",
  );
});

test("toggleProductDescriptionH1 wraps current line", () => {
  const result = toggleProductDescriptionH1("Строка", 0, 0);
  assert.equal(result.value, "# Строка");
  assert.equal(result.selectionStart, 2);
});

test("toggleProductDescriptionH1 unwraps H1 line", () => {
  const result = toggleProductDescriptionH1("# Строка", 2, 2);
  assert.equal(result.value, "Строка");
});

test("toggleProductDescriptionH1 wraps selection", () => {
  const result = toggleProductDescriptionH1("aaa BBB ccc", 4, 7);
  assert.equal(result.value, "aaa # BBB ccc");
});
