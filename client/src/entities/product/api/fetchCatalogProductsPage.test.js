import { beforeEach, describe, expect, it, vi } from "vitest";

import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { buildCatalogProductsPage } from "../../../test/fixtures/apiFixtures.js";

const getMock = vi.fn();

vi.mock("../../../shared/api/index.js", () => ({
  apiClient: {
    get: (...args) => getMock(...args),
  },
}));

const { fetchCatalogProductsPage } = await import("./fetchCatalogProductsPage.js");

describe("fetchCatalogProductsPage", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("fetches catalog page and parses contract", async () => {
    const page = buildCatalogProductsPage();
    getMock.mockResolvedValue({
      data: { success: true, data: page },
    });

    const result = await fetchCatalogProductsPage({ page: 1, search: "аспирин" });

    expect(getMock).toHaveBeenCalledWith("/product", {
      params: expect.objectContaining({
        page: 1,
        search: "аспирин",
      }),
    });
    expect(result.products).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it("throws on invalid envelope", async () => {
    getMock.mockResolvedValue({ data: { success: false } });

    await expect(fetchCatalogProductsPage({ page: 1 })).rejects.toThrow(
      API_CLIENT_UI.INVALID_SERVER_RESPONSE,
    );
  });
});
