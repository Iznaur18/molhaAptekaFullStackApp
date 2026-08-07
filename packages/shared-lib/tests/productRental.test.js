import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isProductRentalConfigured,
  PRODUCT_RENTAL_PRICE_UNIT_DAY,
  PRODUCT_RENTAL_PRICE_UNIT_HOUR,
} from "../dist/index.js";

test("isProductRentalConfigured requires positive price and unit", () => {
  assert.equal(
    isProductRentalConfigured({
      productRentalPriceRub: 500,
      productRentalPriceUnit: PRODUCT_RENTAL_PRICE_UNIT_DAY,
    }),
    true,
  );
  assert.equal(
    isProductRentalConfigured({
      productRentalPriceRub: 100,
      productRentalPriceUnit: PRODUCT_RENTAL_PRICE_UNIT_HOUR,
    }),
    true,
  );
  assert.equal(
    isProductRentalConfigured({
      productRentalPriceRub: 0,
      productRentalPriceUnit: PRODUCT_RENTAL_PRICE_UNIT_DAY,
    }),
    false,
  );
  assert.equal(
    isProductRentalConfigured({
      productRentalPriceRub: 100,
      productRentalPriceUnit: "week",
    }),
    false,
  );
});
