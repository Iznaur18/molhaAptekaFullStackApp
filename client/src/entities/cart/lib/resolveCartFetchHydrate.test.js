import { describe, expect, it } from "vitest";

import { resolveCartFetchHydrate } from "./resolveCartFetchHydrate.js";

describe("resolveCartFetchHydrate", () => {
  it("hydrates only on success", () => {
    expect(
      resolveCartFetchHydrate({ isSuccess: true, isError: false }),
    ).toBe("hydrate");
  });

  it("blocks sync on fetch error (no empty PUT)", () => {
    expect(
      resolveCartFetchHydrate({ isSuccess: false, isError: true }),
    ).toBe("block-sync");
  });

  it("waits while loading", () => {
    expect(
      resolveCartFetchHydrate({ isSuccess: false, isError: false }),
    ).toBe("wait");
  });
});
