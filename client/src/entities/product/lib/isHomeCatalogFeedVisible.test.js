import { describe, expect, it } from "vitest";

import { isHomeCatalogFeedVisible } from "./isHomeCatalogFeedVisible.js";

describe("isHomeCatalogFeedVisible", () => {
  it("true only on unfiltered home", () => {
    expect(
      isHomeCatalogFeedVisible({
        isHomeCatalogMainView: true,
      }),
    ).toBe(true);
  });

  it("false when categoryId filter is active", () => {
    expect(
      isHomeCatalogFeedVisible({
        isHomeCatalogMainView: true,
        selectedCategoryId: "64aaaaaaaaaaaaaaaaaaaaaa",
      }),
    ).toBe(false);
  });

  it("false when not home main view", () => {
    expect(
      isHomeCatalogFeedVisible({
        isHomeCatalogMainView: false,
      }),
    ).toBe(false);
  });
});
