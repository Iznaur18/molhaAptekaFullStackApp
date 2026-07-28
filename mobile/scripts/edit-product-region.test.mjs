import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const editScreen = readFileSync(
  join(root, "features/edit-product/ui/EditProductScreen.tsx"),
  "utf8",
);

describe("edit product region parity", () => {
  it("wires productRegionCode in edit screen", () => {
    assert.match(editScreen, /RuRegionSelect/);
    assert.match(editScreen, /productRegionCode/);
    assert.match(editScreen, /ERROR_SALE_REGION_REQUIRED/);
  });
});
