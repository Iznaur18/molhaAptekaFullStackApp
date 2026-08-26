import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const read = (relativePath) =>
  readFileSync(path.join(root, relativePath), "utf8");

const editScreen = read("features/edit-product/ui/EditProductScreen.tsx");
const wizardScreen = read("features/create-product/ui/CreateProductScreen.tsx");
const modalShell = read("shared/ui/ProductModalShell.tsx");

assert.match(editScreen, /ProductWizardScreen mode="edit"/);
assert.match(wizardScreen, /ProductModalShell/);
assert.match(wizardScreen, /CREATE_PRODUCT_UI\.EDIT_TITLE/);
assert.match(wizardScreen, /ШАГ \$\{stepIndex \+ 1\} ИЗ \$\{steps\.length\}/);
assert.match(modalShell, /MODAL_BACKDROP_SCRIM|useProductModalShellStyles/);
assert.match(wizardScreen, /fullScreen/);

console.log("edit-product-wizard-parity.test.mjs: ok");
