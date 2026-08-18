import { describe, expect, it } from "vitest";

import {
  shouldShowAddressPrompt,
  userHasProfileAddress,
} from "./shouldShowAddressPrompt.js";

describe("userHasProfileAddress", () => {
  it("is false for empty / whitespace", () => {
    expect(userHasProfileAddress(null)).toBe(false);
    expect(userHasProfileAddress({})).toBe(false);
    expect(userHasProfileAddress({ userAddress: "  " })).toBe(false);
  });

  it("is true for a saved line", () => {
    expect(userHasProfileAddress({ userAddress: "г Грозный, ул Ленина, д 1" })).toBe(
      true,
    );
  });
});

describe("shouldShowAddressPrompt", () => {
  const ready = {
    cookieAccepted: true,
    isAuthorized: true,
    hasAddress: false,
    seenThisSession: false,
    delayElapsed: true,
    isCatalogPath: true,
    blockingUi: false,
  };

  it("opens when all gates pass", () => {
    expect(shouldShowAddressPrompt(ready)).toBe(true);
  });

  it("waits for cookie and delay", () => {
    expect(shouldShowAddressPrompt({ ...ready, cookieAccepted: false })).toBe(false);
    expect(shouldShowAddressPrompt({ ...ready, delayElapsed: false })).toBe(false);
  });

  it("skips guests, filled address, other screens, blocking ui", () => {
    expect(shouldShowAddressPrompt({ ...ready, isAuthorized: false })).toBe(false);
    expect(shouldShowAddressPrompt({ ...ready, hasAddress: true })).toBe(false);
    expect(shouldShowAddressPrompt({ ...ready, isCatalogPath: false })).toBe(false);
    expect(shouldShowAddressPrompt({ ...ready, blockingUi: true })).toBe(false);
    expect(shouldShowAddressPrompt({ ...ready, seenThisSession: true })).toBe(false);
  });
});
