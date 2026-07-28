import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { patchBodyTouchesModerationContent } from "../services/product/productModeration.js";

describe("patchBodyTouchesModerationContent region", () => {
  it("считает productRegionCode контент-правкой", () => {
    assert.equal(
      patchBodyTouchesModerationContent({ productRegionCode: "RU-CE" }),
      true,
    );
  });

  it("не трогает модерацию на auction-only", () => {
    assert.equal(
      patchBodyTouchesModerationContent({ productAuctionEnabled: true }),
      false,
    );
  });
});
