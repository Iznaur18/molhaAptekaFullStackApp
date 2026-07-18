import { describe, expect, it } from "vitest";

import {
  CATALOG_GRID_MOBILE_BREAKPOINT_PX,
  CATALOG_GRID_MOBILE_COLUMNS,
  CATALOG_GRID_TABLET_BREAKPOINT_PX,
  CATALOG_GRID_TABLET_COLUMNS,
} from "./catalogGridVirtualizationConstants.js";
import { getCatalogGridColumnCount } from "./getCatalogGridColumnCount.js";

describe("getCatalogGridColumnCount", () => {
  it("returns 1 for invalid widths", () => {
    expect(getCatalogGridColumnCount(0)).toBe(1);
    expect(getCatalogGridColumnCount(-10)).toBe(1);
    expect(getCatalogGridColumnCount(Number.NaN)).toBe(1);
  });

  it("returns 3 columns on mobile widths", () => {
    expect(getCatalogGridColumnCount(320)).toBe(CATALOG_GRID_MOBILE_COLUMNS);
    expect(getCatalogGridColumnCount(430)).toBe(CATALOG_GRID_MOBILE_COLUMNS);
    expect(getCatalogGridColumnCount(CATALOG_GRID_MOBILE_BREAKPOINT_PX)).toBe(
      CATALOG_GRID_MOBILE_COLUMNS,
    );
  });

  it("returns 4 columns on tablet widths", () => {
    expect(getCatalogGridColumnCount(641)).toBe(CATALOG_GRID_TABLET_COLUMNS);
    expect(getCatalogGridColumnCount(900)).toBe(CATALOG_GRID_TABLET_COLUMNS);
    expect(getCatalogGridColumnCount(CATALOG_GRID_TABLET_BREAKPOINT_PX)).toBe(
      CATALOG_GRID_TABLET_COLUMNS,
    );
  });

  it("uses denser auto-fill on desktop", () => {
    expect(getCatalogGridColumnCount(1024)).toBeGreaterThanOrEqual(
      CATALOG_GRID_TABLET_COLUMNS,
    );
    expect(getCatalogGridColumnCount(1200)).toBeGreaterThanOrEqual(5);
  });
});
