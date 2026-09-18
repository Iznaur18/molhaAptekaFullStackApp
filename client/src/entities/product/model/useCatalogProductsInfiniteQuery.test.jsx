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

const { useCatalogProductsInfiniteQuery } =
  await import("./useCatalogProductsInfiniteQuery.js");

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

  it("429 на догрузке оставляет ленту и не повторяет запрос", async () => {
    const firstPage = buildCatalogProductsPage({
      pagination: { page: 1, limit: 24, total: 48, totalPages: 2 },
    });
    const rateLimited = Object.assign(new Error("Слишком много запросов"), {
      status: 429,
    });
    fetchCatalogProductsPageMock
      .mockResolvedValueOnce(firstPage)
      .mockRejectedValue(rateLimited);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCatalogProductsInfiniteQuery(baseParams), {
      wrapper: createQueryWrapper(queryClient),
    });
    await waitFor(() => {
      expect(result.current.products).toHaveLength(1);
    });

    await result.current.query.fetchNextPage();

    await waitFor(() => {
      expect(result.current.catalogLoadMoreError).toBe("Слишком много запросов");
    });
    expect(result.current.catalogStatus.kind).toBe("idle");
    expect(result.current.products).toEqual(firstPage.products);
    expect(fetchCatalogProductsPageMock).toHaveBeenCalledTimes(2);
  });
});
