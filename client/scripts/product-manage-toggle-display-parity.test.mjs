import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("client buildProductManageToggleImageByVariant maps keys to variants", async () => {
  const source = readFileSync(
    join(root, "src/entities/product-manage-toggle-display/lib/buildProductManageToggleImageByVariant.js"),
    "utf8",
  );

  assert.match(source, /PRODUCT_MANAGE_TOGGLE_VARIANT_BY_KEY/);
  assert.match(source, /byKey\.get\(toggleKey\)/);
});

test("ProductManageToggleRow uses palette and imageUrl", async () => {
  const jsx = readFileSync(
    join(root, "src/entities/product/ui/ProductManageToggleRow.jsx"),
    "utf8",
  );
  const css = readFileSync(
    join(root, "src/entities/product/ui/ProductManageToggleRow.css"),
    "utf8",
  );

  assert.match(jsx, /resolveProductManageTogglePalette/);
  assert.match(jsx, /product-manage-toggle-row__artwork/);
  assert.match(css, /border-radius: 2\.5rem/);
  assert.match(css, /min-height: 4\.5rem/);
});

test("ProductEditManageSection passes manage toggle images", async () => {
  const source = readFileSync(
    join(root, "src/entities/product/ui/ProductEditManageSection.jsx"),
    "utf8",
  );

  assert.match(source, /useProductManageToggleImagesByVariant/);
  assert.match(source, /imageByVariant\.auction/);
  assert.match(source, /imageByVariant\.raffle/);
});

test("admin page renders four manage toggle cards", async () => {
  const page = readFileSync(
    join(
      root,
      "src/pages/product-manage-toggle-display-admin/ui/ProductManageToggleDisplayAdminPage.jsx",
    ),
    "utf8",
  );
  const cards = readFileSync(
    join(root, "src/entities/product-manage-toggle-display/lib/productManageToggleAdminCards.js"),
    "utf8",
  );

  assert.match(page, /PRODUCT_MANAGE_TOGGLE_ADMIN_CARDS\.map/);
  assert.match(cards, /auction/);
  assert.match(cards, /installment/);
  assert.match(cards, /raffle/);
  assert.match(cards, /visibility/);
});
