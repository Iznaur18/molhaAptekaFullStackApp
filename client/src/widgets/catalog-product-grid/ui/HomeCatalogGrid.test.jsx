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

test("виртуализация включается больше чем на 50 товарах", () => {
  const { container, rerender } = render(
    <HomeCatalogGrid {...baseProps} products={makeProducts(0, 50)} />,
  );
  expect(container.querySelector(".app-shell__grid-virtual-host")).toBeNull();

  rerender(<HomeCatalogGrid {...baseProps} products={makeProducts(0, 51)} />);

  expect(container.querySelector(".app-shell__grid-virtual-host")).not.toBeNull();
});
