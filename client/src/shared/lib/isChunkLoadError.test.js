import { describe, expect, it } from "vitest";

import { isChunkLoadError } from "./isChunkLoadError.js";

describe("isChunkLoadError", () => {
  it("detects Vite dynamic import failures", () => {
    expect(
      isChunkLoadError(
        new TypeError(
          "Failed to fetch dynamically imported module: https://gitorg.ru/assets/x.js",
        ),
      ),
    ).toBe(true);
  });

  it("ignores ordinary errors", () => {
    expect(isChunkLoadError(new Error("user is null"))).toBe(false);
  });
});
