import { MARKETING_ATTRIBUTION_STORAGE_KEY } from "@izibuy/shared-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  captureMarketingAttribution,
  readMarketingAttributionForSubmit,
  resetMarketingAttributionCaptureState,
} from "./marketingAttributionStorage.js";

const NOW = new Date("2026-09-17T10:00:00.000Z");

describe("marketingAttributionStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetMarketingAttributionCaptureState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores the first touch and keeps it after a later campaign", () => {
    captureMarketingAttribution("?utm_source=vk&utm_medium=post", { now: NOW });
    captureMarketingAttribution("?utm_source=telegram", {
      now: new Date(NOW.getTime() + 60_000),
    });

    const submitted = readMarketingAttributionForSubmit(
      new Date(NOW.getTime() + 120_000),
    );
    expect(submitted?.firstTouch?.source).toBe("vk");
    expect(submitted?.lastTouch?.source).toBe("telegram");
  });

  it("uses the external referrer only once per page load", () => {
    vi.spyOn(document, "referrer", "get").mockReturnValue("https://vk.com/wall1");

    const first = captureMarketingAttribution("", { now: NOW });
    expect(first?.firstTouch?.source).toBe("vk.com");
    expect(first?.firstTouch?.medium).toBe("referral");

    const stored = window.localStorage.getItem(MARKETING_ATTRIBUTION_STORAGE_KEY);
    captureMarketingAttribution("", { now: new Date(NOW.getTime() + 60_000) });
    expect(window.localStorage.getItem(MARKETING_ATTRIBUTION_STORAGE_KEY)).toBe(stored);
  });

  it("returns nothing for a direct visit", () => {
    expect(captureMarketingAttribution("", { now: NOW })).toBeNull();
    expect(readMarketingAttributionForSubmit(NOW)).toBeNull();
  });

  it("ignores corrupted storage", () => {
    window.localStorage.setItem(MARKETING_ATTRIBUTION_STORAGE_KEY, "{not json");
    expect(readMarketingAttributionForSubmit(NOW)).toBeNull();
    const merged = captureMarketingAttribution("?utm_source=vk", { now: NOW });
    expect(merged?.firstTouch?.source).toBe("vk");
  });
});
