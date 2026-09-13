import { act, fireEvent, render } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { ProductMediaSwipePager } from "./ProductMediaSwipePager.jsx";

/**
 * jsdom без PointerEvent: шлём MouseEvent с типом pointer* и нужными полями.
 *
 * @param {Element} element
 * @param {string} type
 * @param {{ x: number; y?: number; t: number }} init
 */
function pointer(element, type, { x, y = 0, t }) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: 0,
  });
  Object.defineProperty(event, "pointerId", { value: 1 });
  Object.defineProperty(event, "pointerType", { value: "touch" });
  Object.defineProperty(event, "timeStamp", { value: t });
  act(() => {
    element.dispatchEvent(event);
  });
}

function renderPager({ activeIndex = 0, onParentClick = () => {} } = {}) {
  const onIndexChange = vi.fn();
  const renderSlide = (index) => <img alt="" data-slide={index} />;
  const view = (index) => (
    <div onClick={onParentClick}>
      <ProductMediaSwipePager
        slideCount={4}
        activeIndex={index}
        onIndexChange={onIndexChange}
        renderSlide={renderSlide}
      />
    </div>
  );
  const utils = render(view(activeIndex));
  const root = utils.container.querySelector(".product-media-swipe-pager");
  Object.defineProperty(root, "clientWidth", { value: 300, configurable: true });
  const track = utils.container.querySelector(".product-media-swipe-pager__track");
  return {
    ...utils,
    root,
    track,
    onIndexChange,
    rerenderAt: (index) => utils.rerender(view(index)),
  };
}

const renderedSlides = (container) =>
  [...container.querySelectorAll("[data-slide]")].map((node) =>
    Number(node.getAttribute("data-slide")),
  );

test("свайп влево дальше порога листает на следующее фото", () => {
  const { root, onIndexChange } = renderPager();

  pointer(root, "pointerdown", { x: 200, t: 0 });
  pointer(root, "pointermove", { x: 190, t: 10 });
  pointer(root, "pointermove", { x: 100, t: 200 });
  pointer(root, "pointerup", { x: 100, t: 400 });

  expect(onIndexChange).toHaveBeenCalledWith(1);
});

test("короткий медленный сдвиг возвращает фото на место", () => {
  const { root, track, onIndexChange } = renderPager();

  pointer(root, "pointerdown", { x: 200, t: 0 });
  pointer(root, "pointermove", { x: 190, t: 10 });
  pointer(root, "pointermove", { x: 180, t: 300 });
  expect(track.style.transform).toBe("translate3d(calc(0% + -20px), 0, 0)");
  pointer(root, "pointerup", { x: 180, t: 600 });

  expect(onIndexChange).not.toHaveBeenCalled();
  expect(track.style.transform).toBe("translate3d(0%, 0, 0)");
});

test("быстрый короткий смах листает", () => {
  const { root, onIndexChange } = renderPager();

  pointer(root, "pointerdown", { x: 200, t: 0 });
  pointer(root, "pointermove", { x: 190, t: 5 });
  pointer(root, "pointermove", { x: 170, t: 20 });
  pointer(root, "pointerup", { x: 170, t: 30 });

  expect(onIndexChange).toHaveBeenCalledWith(1);
});

test("вертикальный жест остаётся прокрутке ленты", () => {
  const { root, track, onIndexChange } = renderPager();

  pointer(root, "pointerdown", { x: 200, y: 0, t: 0 });
  pointer(root, "pointermove", { x: 203, y: 40, t: 20 });
  pointer(root, "pointermove", { x: 150, y: 90, t: 40 });
  pointer(root, "pointerup", { x: 150, y: 90, t: 60 });

  expect(onIndexChange).not.toHaveBeenCalled();
  expect(track.style.transform).toBe("translate3d(0%, 0, 0)");
});

test("за крайнее фото не листает", () => {
  const { root, onIndexChange } = renderPager();

  pointer(root, "pointerdown", { x: 100, t: 0 });
  pointer(root, "pointermove", { x: 110, t: 10 });
  pointer(root, "pointermove", { x: 250, t: 200 });
  pointer(root, "pointerup", { x: 250, t: 400 });

  expect(onIndexChange).not.toHaveBeenCalled();
});

test("клик после свайпа не открывает товар, следующий тап — открывает", () => {
  const onParentClick = vi.fn();
  const { root, container } = renderPager({ onParentClick });
  const image = container.querySelector("[data-slide='0']");

  pointer(root, "pointerdown", { x: 200, t: 0 });
  pointer(root, "pointermove", { x: 150, t: 20 });
  pointer(root, "pointerup", { x: 150, t: 30 });
  fireEvent.click(image);
  expect(onParentClick).not.toHaveBeenCalled();

  pointer(root, "pointerdown", { x: 200, t: 100 });
  pointer(root, "pointerup", { x: 200, t: 150 });
  fireEvent.click(image);
  expect(onParentClick).toHaveBeenCalledTimes(1);
});

test("в DOM только текущее фото и соседи", () => {
  const { container, rerenderAt } = renderPager();
  expect(renderedSlides(container)).toEqual([0, 1]);

  rerenderAt(2);

  expect(renderedSlides(container)).toEqual([1, 2, 3]);
});
