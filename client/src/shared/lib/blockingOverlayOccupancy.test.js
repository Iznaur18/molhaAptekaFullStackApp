import { describe, expect, it } from "vitest";

import {
  acquireBlockingOverlay,
  getBlockingOverlayCount,
  subscribeBlockingOverlayCount,
} from "./blockingOverlayOccupancy.js";

describe("blockingOverlayOccupancy", () => {
  it("acquire/release notifies subscribers", () => {
    const counts = [];
    const unsubscribe = subscribeBlockingOverlayCount((count) => counts.push(count));
    const release = acquireBlockingOverlay();
    expect(getBlockingOverlayCount()).toBe(1);
    release();
    expect(getBlockingOverlayCount()).toBe(0);
    unsubscribe();
    expect(counts).toEqual([1, 0]);
  });
});
