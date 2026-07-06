import { describe, expect, it } from "vitest";

import {
  isBrowserHeicImageFile,
  resolveBrowserImageMimeType,
} from "./resolveBrowserImageMimeType.js";

describe("resolveBrowserImageMimeType", () => {
  it("normalizes image/jpg to image/jpeg", () => {
    const file = new File(["x"], "photo.jpg", { type: "image/jpg" });
    expect(resolveBrowserImageMimeType(file)).toBe("image/jpeg");
  });

  it("falls back to extension when Safari sends empty type", () => {
    const file = new File(["x"], "photo.heic", { type: "" });
    expect(resolveBrowserImageMimeType(file)).toBe("image/heic");
  });
});

describe("isBrowserHeicImageFile", () => {
  it("detects HEIC by extension even with jpeg mime", () => {
    const file = new File(["x"], "IMG_0001.HEIC", { type: "image/jpeg" });
    expect(isBrowserHeicImageFile(file)).toBe(true);
  });
});
