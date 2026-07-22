import {
  PRODUCT_PRICE_MARKET_STATUS_ABOVE,
  PRODUCT_PRICE_MARKET_STATUS_AT,
  PRODUCT_PRICE_MARKET_STATUS_BELOW,
  PRODUCT_PRICE_MARKET_STATUS_DEFAULT,
  PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
} from "@molha/api-contract";
import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { resolveProductPriceMarketStatusPresentation } from "./productPriceMarketStatus.js";

describe("resolveProductPriceMarketStatusPresentation", () => {
  it("defaults missing status to unknown (gray)", () => {
    const view = resolveProductPriceMarketStatusPresentation(undefined);
    assert.equal(view.status, PRODUCT_PRICE_MARKET_STATUS_DEFAULT);
    assert.equal(view.status, PRODUCT_PRICE_MARKET_STATUS_UNKNOWN);
    assert.equal(view.backgroundColor, "#9ca3af");
  });

  it("maps all known statuses", () => {
    assert.equal(
      resolveProductPriceMarketStatusPresentation(PRODUCT_PRICE_MARKET_STATUS_ABOVE)
        .backgroundColor,
      "#ef4444",
    );
    assert.equal(
      resolveProductPriceMarketStatusPresentation(PRODUCT_PRICE_MARKET_STATUS_AT)
        .backgroundColor,
      "#facc15",
    );
    assert.equal(
      resolveProductPriceMarketStatusPresentation(PRODUCT_PRICE_MARKET_STATUS_BELOW)
        .backgroundColor,
      "#22c55e",
    );
  });
});
