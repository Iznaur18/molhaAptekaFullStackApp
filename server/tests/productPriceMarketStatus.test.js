import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCT_PRICE_MARKET_STATUS_ABOVE,
  PRODUCT_PRICE_MARKET_STATUS_AT,
  PRODUCT_PRICE_MARKET_STATUS_BELOW,
  PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
  medianPositiveNumbers,
  resolveProductPriceMarketStatusFromPeers,
} from "../constants/productPriceMarketStatusConstants.js";

test("medianPositiveNumbers", () => {
  assert.equal(medianPositiveNumbers([10, 30, 20]), 20);
  assert.equal(medianPositiveNumbers([10, 20]), 15);
  assert.equal(medianPositiveNumbers([]), null);
});

test("resolveProductPriceMarketStatusFromPeers requires min peers", () => {
  assert.equal(
    resolveProductPriceMarketStatusFromPeers({
      productPrice: 100,
      peerPrices: [90, 110],
    }),
    PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
  );
});

test("resolveProductPriceMarketStatusFromPeers band ±12%", () => {
  const peers = [100, 100, 100];
  assert.equal(
    resolveProductPriceMarketStatusFromPeers({ productPrice: 100, peerPrices: peers }),
    PRODUCT_PRICE_MARKET_STATUS_AT,
  );
  assert.equal(
    resolveProductPriceMarketStatusFromPeers({ productPrice: 112, peerPrices: peers }),
    PRODUCT_PRICE_MARKET_STATUS_AT,
  );
  assert.equal(
    resolveProductPriceMarketStatusFromPeers({ productPrice: 113, peerPrices: peers }),
    PRODUCT_PRICE_MARKET_STATUS_ABOVE,
  );
  assert.equal(
    resolveProductPriceMarketStatusFromPeers({ productPrice: 88, peerPrices: peers }),
    PRODUCT_PRICE_MARKET_STATUS_AT,
  );
  assert.equal(
    resolveProductPriceMarketStatusFromPeers({ productPrice: 87, peerPrices: peers }),
    PRODUCT_PRICE_MARKET_STATUS_BELOW,
  );
});
