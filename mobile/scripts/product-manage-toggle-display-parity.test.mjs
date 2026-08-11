import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("mobile ProductManageToggleRow uses themed styles and variant", async () => {
  const source = readFileSync(
    join(root, "entities/product/ui/ProductManageToggleRow.tsx"),
    "utf8",
  );

  assert.match(source, /ProductManageToggleRowVariant/);
  assert.match(source, /useProductManageToggleRowStyles/);
  assert.match(source, /imageUrl\?: string \| null/);
});

test("mobile ProductEditManageSection wires installment manage toggle", async () => {
  const source = readFileSync(
    join(root, "entities/product/ui/ProductEditManageSection.tsx"),
    "utf8",
  );

  assert.match(source, /ProductManageToggleRow/);
  assert.match(source, /variant="installment"/);
});

test("mobile entity mirrors manage toggle display API", async () => {
  const fetchSource = readFileSync(
    join(root, "entities/product-manage-toggle-display/api/fetchProductManageToggleDisplays.ts"),
    "utf8",
  );

  assert.match(fetchSource, /\/product\/manage-toggle-displays/);
  assert.match(fetchSource, /FETCH_MANAGE_TOGGLE_DISPLAYS_FALLBACK/);
});
