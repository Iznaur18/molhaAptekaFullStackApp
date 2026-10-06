import assert from "node:assert/strict";
import test from "node:test";

import { categoryDisplaySettingsPatchBodySchema } from "@molha/api-contract";

import { resolveTileImagesEnabled } from "../services/product/productCategoryDisplaySettings.js";

test("картинки плиток: пока админ не трогал — показываются", () => {
  assert.equal(resolveTileImagesEnabled(null), true);
  assert.equal(resolveTileImagesEnabled(undefined), true);
  assert.equal(resolveTileImagesEnabled({}), true);
});

test("картинки плиток: берём сохранённое значение", () => {
  assert.equal(resolveTileImagesEnabled({ tileImagesEnabled: false }), false);
  assert.equal(resolveTileImagesEnabled({ tileImagesEnabled: true }), true);
});

test("картинки плиток: тело запроса — только явное да/нет", () => {
  assert.equal(
    categoryDisplaySettingsPatchBodySchema.safeParse({ tileImagesEnabled: false })
      .success,
    true,
  );
  assert.equal(categoryDisplaySettingsPatchBodySchema.safeParse({}).success, false);
  assert.equal(
    categoryDisplaySettingsPatchBodySchema.safeParse({ tileImagesEnabled: "нет" })
      .success,
    false,
  );
});
