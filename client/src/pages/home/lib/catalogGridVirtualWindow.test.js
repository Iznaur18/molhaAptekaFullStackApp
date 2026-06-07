import { describe, expect, it } from "vitest";

import {
  computeCatalogVirtualWindow,
  getCatalogHostTop,
  getCatalogScrollTop,
  getCatalogViewportHeight,
} from "./catalogGridVirtualWindow.js";

describe("computeCatalogVirtualWindow", () => {
  it("returns full range when virtualization inputs are empty", () => {
    expect(
      computeCatalogVirtualWindow({
        itemCount: 0,
        columnCount: 3,
        rowHeight: 400,
        scrollTop: 0,
        hostTop: 100,
        viewportHeight: 800,
      }),
    ).toEqual({
      startIndex: 0,
      endIndex: 0,
      offsetTop: 0,
      totalHeight: 0,
      rowHeight: 520,
    });
  });

  it("computes visible window with overscan", () => {
    const result = computeCatalogVirtualWindow({
      itemCount: 120,
      columnCount: 4,
      rowHeight: 500,
      scrollTop: 1500,
      hostTop: 200,
      viewportHeight: 900,
      overscanRows: 1,
    });

    expect(result.startIndex).toBe(4);
    expect(result.endIndex).toBe(27);
    expect(result.offsetTop).toBe(500);
    expect(result.totalHeight).toBe(15000);
  });

  it("clamps end index to item count", () => {
    const result = computeCatalogVirtualWindow({
      itemCount: 10,
      columnCount: 3,
      rowHeight: 400,
      scrollTop: 5000,
      hostTop: 0,
      viewportHeight: 800,
      overscanRows: 0,
    });

    expect(result.endIndex).toBe(9);
  });
});

describe("catalog viewport helpers", () => {
  it("reads scroll and viewport metrics from window", () => {
    expect(typeof getCatalogScrollTop()).toBe("number");
    expect(typeof getCatalogViewportHeight()).toBe("number");
  });

  it("computes host top from bounding rect", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    Object.defineProperty(host, "getBoundingClientRect", {
      value: () => ({
        top: 120,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
      }),
    });

    expect(getCatalogHostTop(host)).toBeGreaterThanOrEqual(120);
    host.remove();
  });
});
