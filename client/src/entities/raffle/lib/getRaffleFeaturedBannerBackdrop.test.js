import { describe, expect, it } from "vitest";

import { getRaffleFeaturedBannerBackdrop } from "./getRaffleFeaturedBannerBackdrop.js";

describe("getRaffleFeaturedBannerBackdrop", () => {
  it("returns image backdrop css vars when prize image exists", () => {
    const result = getRaffleFeaturedBannerBackdrop({
      prizeMediaType: "image",
      prizeImageUrl: "/uploads/prize.jpg",
    });

    expect(result.hasBackdrop).toBe(true);
    expect(result.useVideoBackdrop).toBe(false);
    expect(result.style?.["--raffle-featured-banner-backdrop-image"]).toContain(
      "/uploads/prize.jpg",
    );
  });

  it("falls back to video backdrop when only prize video exists", () => {
    const result = getRaffleFeaturedBannerBackdrop({
      prizeMediaType: "video",
      prizeVideoUrl: "/uploads/prize.mp4",
    });

    expect(result.hasBackdrop).toBe(true);
    expect(result.useVideoBackdrop).toBe(true);
    expect(result.style).toBeUndefined();
  });

  it("returns no backdrop without media", () => {
    const result = getRaffleFeaturedBannerBackdrop({
      prizeMediaType: "image",
      prizeImageUrl: "",
    });

    expect(result.hasBackdrop).toBe(false);
    expect(result.useVideoBackdrop).toBe(false);
  });
});
