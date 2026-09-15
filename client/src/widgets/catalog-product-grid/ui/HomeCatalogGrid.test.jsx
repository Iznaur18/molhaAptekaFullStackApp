import { render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { productCardRenders } = vi.hoisted(() => ({
  productCardRenders: new Map(),
}));

vi.mock("../../../entities/product/ui/ProductCard.jsx", () => ({
  ProductCard: ({ product }) => {
    const id = String(product._id);
    productCardRenders.set(id, (productCardRenders.get(id) ?? 0) + 1);
    return <article data-product-id={id} />;
  },
}));

import { PRODUCT_PROMOTION_TIER_BANNER } from "../../../entities/product/lib/calculateProductPromotionPointsCost.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { HomeCatalogGrid } from "./HomeCatalogGrid.jsx";

const noop = () => {};

const baseProps = {
  selectedProductCategory: null,
  hasQuery: false,
  isMineMode: false,
  deletingProductId: null,
  onSellerNameClick: noop,
  onDeleteMyProduct: noop,
  myProductsCatalogError: "",
  onOpenProductDetails: noop,
  togglingAvailabilityProductId: null,
  isAuthorized: false,
  onRequestLoginAddToCart: noop,
  catalogSentinelRef: { current: null },
  catalogHasMore: true,
  isCatalogLoadingMore: false,
  catalogLoadMoreError: null,
  onRetryCatalogLoadMore: noop,
  viewerRegionCode: "RU-MOW",
};

/**
 * @param {number} from
 * @param {number} count
 */
function makeProducts(from, count) {
  return Array.from({ length: count }, (_, index) => ({
    _id: `p${from + index}`,
    productName: `Товар ${from + index}`,
  }));
}

beforeEach(() => {
  productCardRenders.clear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", () => 0);
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("догрузка страницы не перерисовывает уже показанные карточки", () => {
  const firstPage = makeProducts(0, 24);
  const { rerender } = render(<HomeCatalogGrid {...baseProps} products={firstPage} />);
  expect(productCardRenders.get("p0")).toBe(1);

  rerender(
    <HomeCatalogGrid
      {...baseProps}
      products={[...firstPage, ...makeProducts(24, 24)]}
      isCatalogLoadingMore
    />,
  );

  expect(productCardRenders.get("p0")).toBe(1);
  expect(productCardRenders.get("p23")).toBe(1);
  expect(productCardRenders.get("p47")).toBe(1);
});

test("лента разбита на блоки", () => {
  const { container } = render(
    <HomeCatalogGrid {...baseProps} products={makeProducts(0, 51)} />,
  );

  // jsdom: ширина 0 → 1 колонка, в блоке 4 ряда → 13 блоков на 51 товар
  expect(container.querySelectorAll(".app-shell__grid-block")).toHaveLength(13);
  expect(container.querySelectorAll("[data-product-id]")).toHaveLength(51);
});

test("догрузка внизу ленты — скелетон из двух рядов карточек, а не текст", () => {
  const { container, getByRole, queryByText } = render(
    <HomeCatalogGrid
      {...baseProps}
      products={makeProducts(0, 24)}
      isCatalogLoadingMore
    />,
  );

  const skeleton = getByRole("status", { name: HOME_PAGE_UI.CATALOG_LOADING_MORE });
  // jsdom: 1 колонка → два ряда = две карточки-скелетона
  expect(skeleton.querySelectorAll(".catalog-grid-skeleton__card")).toHaveLength(2);
  expect(
    container.querySelector(".app-shell__grid-blocks + .catalog-grid-skeleton"),
  ).toBe(skeleton);
  expect(queryByText(HOME_PAGE_UI.CATALOG_LOADING_MORE)).toBeNull();
});

test("баннер во всю ширину — тоже в ленте блоками, в своём ряду", () => {
  const banner = {
    _id: "banner",
    productName: "Баннер",
    catalogPromotionTier: PRODUCT_PROMOTION_TIER_BANNER,
    catalogPromotionExpiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  };

  const { container } = render(
    <HomeCatalogGrid
      {...baseProps}
      products={[...makeProducts(0, 7), banner]}
      showFullWidthTier3Banners
    />,
  );

  const blocks = container.querySelectorAll(".app-shell__grid-block");
  // 1 колонка: баннер встаёт после 3 карточек и закрывает первый блок из 4 рядов
  expect(blocks).toHaveLength(2);
  const firstBlockIds = [...blocks[0].querySelectorAll("[data-product-id]")].map(
    (node) => node.getAttribute("data-product-id"),
  );
  expect(firstBlockIds).toEqual(["p0", "p1", "p2", "banner"]);
  expect(
    container.querySelector(
      ".app-shell__cell--tier3-full-width [data-product-id='banner']",
    ),
  ).not.toBeNull();
});

test("фильтр «Рядом» — две ленты блоками под общим заголовком", () => {
  const nearby = makeProducts(0, 3).map((product, index) => ({
    ...product,
    distanceMeters: 100 * (index + 1),
  }));

  const { container, getByRole } = render(
    <HomeCatalogGrid
      {...baseProps}
      products={[...nearby, ...makeProducts(3, 5)]}
      catalogNear
    />,
  );

  const feeds = container.querySelectorAll(".app-shell__grid-blocks");
  expect(feeds).toHaveLength(2);
  expect(feeds[0].querySelectorAll("[data-product-id]")).toHaveLength(3);
  expect(feeds[1].querySelectorAll("[data-product-id]")).toHaveLength(5);
  expect(getByRole("heading", { name: HOME_PAGE_UI.NEAR_REGION_SECTION })).toBeTruthy();

  const blockKey = (feed) =>
    feed
      .querySelector("[data-catalog-block-key]")
      .getAttribute("data-catalog-block-key");
  expect(blockKey(feeds[0])).not.toBe(blockKey(feeds[1]));
});
