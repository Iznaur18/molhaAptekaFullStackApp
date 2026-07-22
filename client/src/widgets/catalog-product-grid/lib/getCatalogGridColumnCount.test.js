import { describe, expect, it } from "vitest";

import {
  CATALOG_GRID_2_COL_MAX_PX,
  CATALOG_GRID_3_COL_MAX_PX,
  CATALOG_GRID_4_COL_MIN_PX,
  CATALOG_GRID_COLUMNS_COMPACT,
  CATALOG_GRID_COLUMNS_MEDIUM,
  CATALOG_GRID_COLUMNS_WIDE,
} from "./catalogGridVirtualizationConstants.js";
import { getCatalogGridColumnCount } from "./getCatalogGridColumnCount.js";

describe("getCatalogGridColumnCount", () => {
  it("returns 1 for invalid widths", () => {
    expect(getCatalogGridColumnCount(0)).toBe(1);
    expect(getCatalogGridColumnCount(-10)).toBe(1);
    expect(getCatalogGridColumnCount(Number.NaN)).toBe(1);
  });

  it("returns 2 columns on compact widths", () => {
    expect(getCatalogGridColumnCount(320)).toBe(CATALOG_GRID_COLUMNS_COMPACT);
    expect(getCatalogGridColumnCount(430)).toBe(CATALOG_GRID_COLUMNS_COMPACT);
    expect(getCatalogGridColumnCount(CATALOG_GRID_2_COL_MAX_PX)).toBe(
      CATALOG_GRID_COLUMNS_COMPACT,
    );
  });

  it("returns 3 columns on medium widths", () => {
    expect(getCatalogGridColumnCount(CATALOG_GRID_2_COL_MAX_PX + 1)).toBe(
      CATALOG_GRID_COLUMNS_MEDIUM,
    );
    expect(getCatalogGridColumnCount(900)).toBe(CATALOG_GRID_COLUMNS_MEDIUM);
    expect(getCatalogGridColumnCount(CATALOG_GRID_3_COL_MAX_PX)).toBe(
      CATALOG_GRID_COLUMNS_MEDIUM,
    );
    expect(getCatalogGridColumnCount(CATALOG_GRID_4_COL_MIN_PX - 1)).toBe(
      CATALOG_GRID_COLUMNS_MEDIUM,
    );
  });

  it("returns 4 columns on wide desktop viewports", () => {
    expect(getCatalogGridColumnCount(CATALOG_GRID_4_COL_MIN_PX)).toBe(
      CATALOG_GRID_COLUMNS_WIDE,
    );
    expect(getCatalogGridColumnCount(1440)).toBe(CATALOG_GRID_COLUMNS_WIDE);
    expect(getCatalogGridColumnCount(1920)).toBe(CATALOG_GRID_COLUMNS_WIDE);
  });
});
