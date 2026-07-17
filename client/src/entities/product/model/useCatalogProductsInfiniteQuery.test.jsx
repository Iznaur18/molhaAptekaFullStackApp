import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";
import { buildCatalogProductsPage } from "../../../test/fixtures/apiFixtures.js";

const fetchCatalogProductsPageMock = vi.fn();
const fetchMyProductsPageMock = vi.fn();

vi.mock("../api/fetchCatalogProductsPage.js", () => ({
  fetchCatalogProductsPage: (...args) => fetchCatalogProductsPageMock(...args),
}));

vi.mock("../api/fetchMyProducts.js", () => ({
  fetchMyProductsPage: (...args) => fetchMyProductsPageMock(...args),
}));

vi.mock("../../../shared/lib/useInfiniteScrollSentinel.js", () => ({
  useInfiniteScrollSentinel: () => {},
}));

const { useCatalogProductsInfiniteQuery } = await import("./useCatalogProductsInfiniteQuery.js");

function createQueryWrapper(queryClient) {
  return function QueryWrapper({ children }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const baseParams = {
  isCatalogProductsView: true,
  isMineMode: false,
  isCatalogBrowserMainViewActive: true,
  activeCatalogBrowserCategory: null,
  activeCatalogBrowserCategoryId: null,
  catalogQueryFromUrl: {},
  appliedProductSearchTerm: "",
  selectedProductCategory: null,
  catalogSort: null,
  myProductsModerationFilter: null,
  canModerateProducts: false,
  showHiddenCatalogProducts: false,
};

describe("useCatalogProductsInfiniteQuery", () => {
  beforeEach(() => {
    fetchCatalogProductsPageMock.mockReset();
    fetchMyProductsPageMock.mockReset();
  });

  it("loads public catalog products", async () => {
    const page = buildCatalogProductsPage();
    fetchCatalogProductsPageMock.mockResolvedValue(page);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCatalogProductsInfiniteQuery(baseParams), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.catalogStatus.kind).toBe("idle");
    });

    expect(fetchCatalogProductsPageMock).toHaveBeenCalled();
    expect(result.current.products).toEqual(page.products);
  });

  it("loads mine-mode products via my endpoint", async () => {
    const page = buildCatalogProductsPage({
      products: [{ _id: "507f1f77bcf86cd799439099", productName: "Мой товар" }],
    });
    fetchMyProductsPageMock.mockResolvedValue(page);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () =>
        useCatalogProductsInfiniteQuery({
          ...baseParams,
          isMineMode: true,
        }),
      { wrapper: createQueryWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.products).toHaveLength(1);
    });

    expect(fetchMyProductsPageMock).toHaveBeenCalled();
    expect(fetchCatalogProductsPageMock).not.toHaveBeenCalled();
  });
});
