import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { CatalogGridBlocks } from "./CatalogGridBlocks.jsx";

/** @type {FakeIntersectionObserver[]} */
let observers = [];

class FakeIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? "0px";
    this.targets = new Set();
    observers.push(this);
  }

  observe(target) {
    this.targets.add(target);
  }

  unobserve(target) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
  }

  /** @param {{ target: Element; isIntersecting: boolean; height?: number }[]} entries */
  fire(entries) {
    act(() => {
      this.callback(
        entries.map(({ target, isIntersecting, height = 0 }) => ({
          target,
          isIntersecting,
          boundingClientRect: { height },
        })),
        this,
      );
    });
  }
}

/** Ближний наблюдатель — с меньшим отступом, дальний — с большим. */
function getObserver(kind) {
  const sorted = [...observers].sort(
    (a, b) => Number.parseInt(a.rootMargin, 10) - Number.parseInt(b.rootMargin, 10),
  );
  return kind === "near" ? sorted[0] : sorted[sorted.length - 1];
}

/** @param {number} count */
const makeItems = (count) =>
  Array.from({ length: count }, (_, index) => ({ id: index }));

const renderItem = (item) => <div key={item.id} data-item={item.id} role="listitem" />;

const getItemKey = (item) => String(item.id);

/** @param {{ id: number }[]} items */
const grid = (items) => (
  <CatalogGridBlocks
    items={items}
    columnCount={2}
    renderItem={renderItem}
    getItemKey={getItemKey}
    ariaLabel="Лента"
  />
);

beforeEach(() => {
  observers = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("блок вдали от экрана сворачивается в заглушку своей высоты и разворачивается при подходе", () => {
  const { container } = render(grid(makeItems(12)));
  const blocks = container.querySelectorAll("[data-catalog-block-key]");
  expect(blocks).toHaveLength(2);
  expect(blocks[0].querySelectorAll("[data-item]")).toHaveLength(8);

  getObserver("far").fire([{ target: blocks[0], isIntersecting: false, height: 1284 }]);

  expect(blocks[0].style.height).toBe("1284px");
  expect(blocks[0].querySelectorAll("[data-item]")).toHaveLength(0);
  // Заглушка — один пустой элемент, число товаров только в атрибуте.
  expect(blocks[0].childElementCount).toBe(0);
  expect(blocks[0].getAttribute("data-catalog-block-count")).toBe("8");
  expect(blocks[1].querySelectorAll("[data-item]")).toHaveLength(4);

  getObserver("near").fire([{ target: blocks[0], isIntersecting: true }]);

  expect(blocks[0].style.height).toBe("");
  expect(blocks[0].querySelectorAll("[data-item]")).toHaveLength(8);
});

test("не сворачивает блок, у которого нет высоты (лента скрыта)", () => {
  const { container } = render(grid(makeItems(8)));
  const block = container.querySelector("[data-catalog-block-key]");

  getObserver("far").fire([{ target: block, isIntersecting: false, height: 0 }]);

  expect(block.querySelectorAll("[data-item]")).toHaveLength(8);
});

test("в свёрнутый хвостовой блок дописались товары — он отрисовывается целиком", () => {
  const { container, rerender } = render(grid(makeItems(12)));
  const tail = container.querySelectorAll("[data-catalog-block-key]")[1];

  getObserver("far").fire([{ target: tail, isIntersecting: false, height: 642 }]);
  expect(tail.querySelectorAll("[data-item]")).toHaveLength(0);

  rerender(grid(makeItems(16)));

  expect(tail.style.height).toBe("");
  expect(tail.querySelectorAll("[data-item]")).toHaveLength(8);
});
