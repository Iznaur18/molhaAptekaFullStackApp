import { describe, expect, it } from "vitest";

import { resolveProductInstagramPost } from "./resolveProductInstagramPost.js";

describe("resolveProductInstagramPost", () => {
  it("returns parsed post when product has valid instagram url", () => {
    const parsed = resolveProductInstagramPost({
      productInstagramPostUrl: "https://www.instagram.com/reel/AbCdEfGhIj/",
    });
    expect(parsed?.mediaKind).toBe("reel");
    expect(parsed?.embedUrl).toContain("/embed/");
  });

  it("returns null for empty or invalid url", () => {
    expect(resolveProductInstagramPost({ productInstagramPostUrl: "" })).toBeNull();
    expect(resolveProductInstagramPost({ productInstagramPostUrl: "https://example.com" })).toBeNull();
  });
});
