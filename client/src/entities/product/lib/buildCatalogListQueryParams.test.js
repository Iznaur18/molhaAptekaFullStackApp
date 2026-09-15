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
  viewerRegionCode: "RU-MOW",
};

const emptyExtraFilters = {
  priceMin: null,
  priceMax: null,
  delivery: null,
  pickupOnly: null,
  ratingMin: null,
  withReviews: null,
  returnOnly: null,
  sellerConfirmed: null,
  sellerPremium: null,
};

describe("buildCatalogListQueryParams", () => {
  it("builds public catalog params with filters from URL + viewer region", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      appliedProductSearchTerm: "  аспирин ",
      catalogQueryFromUrl: {
        sort: "price_asc",
        auctionOnly: true,
        followingOnly: true,
      },
      activeCatalogBrowserCategory: "medicines",
      viewerRegionCode: "RU-CE",
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
      rentalOnly: null,
      affiliateOnly: null,
      wholesaleOnly: null,
      buyNFreeOnly: null,
      originalOnly: null,
      near: null,
      flashSaleOnly: null,
      ...emptyExtraFilters,
      regionCode: "RU-CE",
    });
  });

  it("builds mine-mode params with moderation filter (no region)", () => {
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
      rentalOnly: null,
      affiliateOnly: null,
      wholesaleOnly: null,
      buyNFreeOnly: null,
      originalOnly: null,
      near: null,
      flashSaleOnly: null,
      ...emptyExtraFilters,
      regionCode: null,
    });
  });

  it("passes price, delivery, rating and seller filters from URL", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      catalogQueryFromUrl: {
        sort: "newest",
        priceMin: 100,
        priceMax: 500,
        delivery: ["courier", "seller"],
        pickupOnly: true,
        ratingMin: 4,
        withReviews: true,
        returnOnly: true,
        sellerConfirmed: true,
        sellerPremium: true,
      },
    });

    expect(params).toMatchObject({
      priceMin: 100,
      priceMax: 500,
      delivery: "seller,courier",
      pickupOnly: true,
      ratingMin: 4,
      withReviews: true,
      returnOnly: true,
      sellerConfirmed: true,
      sellerPremium: true,
    });
  });

  it("ignores price and delivery filters in mine mode", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      isMineMode: true,
      catalogQueryFromUrl: { priceMax: 500, delivery: ["seller"] },
    });

    expect(params).toMatchObject(emptyExtraFilters);
  });

  it("passes near from URL", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      catalogQueryFromUrl: {
        sort: "newest",
        near: true,
      },
    });

    expect(params.near).toBe(true);
  });

  it("ignores near from URL when nearAllowed is false", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      nearAllowed: false,
      catalogQueryFromUrl: {
        sort: "newest",
        near: true,
      },
    });

    expect(params.near).toBe(null);
  });

  it("passes flashSaleOnly from URL", () => {
    const params = buildCatalogListQueryParams({
      ...baseInput,
      catalogQueryFromUrl: {
        sort: "newest",
        flashSaleOnly: true,
      },
    });

    expect(params.flashSaleOnly).toBe(true);
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
