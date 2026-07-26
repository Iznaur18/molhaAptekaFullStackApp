import { describe, expect, it } from "vitest";

import { buildCatalogListQueryParams } from "./buildCatalogListQueryParams.js";

const baseInput = {
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

describe("buildCatalogListQueryParams", () => {
  it("builds public catalog params with filters from URL", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      appliedProductSearchTerm: "  аспирин ",
      catalogQueryFromUrl: {
        sort: "price_asc",
        auctionOnly: true,
        followingOnly: true,
      },
      activeCatalogBrowserCategory: "medicines",
    });

    expect(params).toEqual({
      scope: "catalog",
      search: "аспирин",
      productCategory: "medicines",
      categoryId: null,
      sellerPersonalCategoryId: null,
      sort: "price_asc",
      moderationStatus: null,
      followingOnly: true,
      auctionOnly: true,
      installmentOnly: null,
      saleOnly: null,
      allCities: null,
    });
  });

  it("builds mine-mode params with moderation filter", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      isMineMode: true,
      selectedProductCategory: "supplements",
      catalogSort: "newest",
      myProductsModerationFilter: "pending",
    });

    expect(params).toEqual({
      scope: "my",
      search: null,
      productCategory: "supplements",
      categoryId: null,
      sellerPersonalCategoryId: null,
      sort: "newest",
      moderationStatus: "pending",
      followingOnly: null,
      auctionOnly: null,
      installmentOnly: null,
      saleOnly: null,
      allCities: null,
    });
  });

  it("uses categoryId instead of slug when tree id is active", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      activeCatalogBrowserCategory: "legacy-slug",
      activeCatalogBrowserCategoryId: "64abc",
    });

    expect(params.productCategory).toBeNull();
    expect(params.categoryId).toBe("64abc");
  });

  it("applies home URL category filters without browser main view", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      isCatalogBrowserMainViewActive: false,
      activeCatalogBrowserCategoryId: "64abc",
      catalogQueryFromUrl: {
        sellerPersonalCategoryId: null,
        sort: "newest",
      },
    });

    expect(params.categoryId).toBe("64abc");
    expect(params.sellerPersonalCategoryId).toBeNull();
  });

  it("applies seller personal category from URL on home", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      isCatalogBrowserMainViewActive: false,
      catalogQueryFromUrl: {
        sellerPersonalCategoryId: "64bbbbbbbbbbbbbbbbbbbbbb",
        sort: "newest",
      },
    });

    expect(params.sellerPersonalCategoryId).toBe("64bbbbbbbbbbbbbbbbbbbbbb");
  });
});
