import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { useCatalogGridVirtualizer } from "./useCatalogGridVirtualizer.js";

const VIEWPORT_HEIGHT = 900;
const MEASURED_ROW_HEIGHT = 300;

/** @type {Map<number, FrameRequestCallback>} */
let pendingFrames;
let renderCount;
/** @type {ReturnType<typeof useCatalogGridVirtualizer> | null} */
let latestWindow;

function flushFrames() {
  const frames = [...pendingFrames.values()];
  pendingFrames.clear();
  frames.forEach((callback) => callback(0));
}

function scrollWindowTo(y) {
  act(() => {
    window.scrollY = y;
    window.dispatchEvent(new Event("scroll"));
    flushFrames();
  });
}

/**
 * @param {{ enabled?: boolean; itemCount: number; columnCount: number; measuredRows?: boolean }} props
 */
function GridProbe({ enabled = true, itemCount, columnCount, measuredRows = false }) {
  const hostRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const gridRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  latestWindow = useCatalogGridVirtualizer({
    enabled,
    hostRef,
    gridRef,
    itemCount,
    columnCount,
  });
  renderCount += 1;

  const setHost = (node) => {
    if (node) {
      // Хост в самом верху документа: его top во вьюпорте = −scrollY.
      node.getBoundingClientRect = () => ({ top: -window.scrollY, height: 0 });
    }
    hostRef.current = node;
  };

  const setCell = (node) => {
    if (node) {
      node.getBoundingClientRect = () => ({ top: 0, height: MEASURED_ROW_HEIGHT });
    }
  };

  return (
    <div ref={setHost}>
      <div ref={gridRef}>
        {measuredRows
          ? Array.from({ length: columnCount }, (_, index) => (
              <div key={index} ref={setCell} />
            ))
          : null}
      </div>
    </div>
  );
}

beforeEach(() => {
  pendingFrames = new Map();
  renderCount = 0;
  latestWindow = null;
  let nextFrameId = 1;

  vi.stubGlobal("requestAnimationFrame", (callback) => {
    const id = nextFrameId;
    nextFrameId += 1;
    pendingFrames.set(id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id) => {
    pendingFrames.delete(id);
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("innerHeight", VIEWPORT_HEIGHT);
  window.scrollY = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.scrollY = 0;
});

test("мелкая прокрутка внутри строки не перерисовывает сетку", () => {
  render(<GridProbe itemCount={240} columnCount={2} />);
  const settledRenders = renderCount;
  const settledWindow = latestWindow;

  for (const y of [10, 20, 30, 40, 50]) {
    scrollWindowTo(y);
  }

  expect(renderCount).toBe(settledRenders);
  expect(latestWindow).toBe(settledWindow);
});

test("переход через строки даёт одну перерисовку и сдвигает окно", () => {
  render(<GridProbe itemCount={240} columnCount={2} />);
  const settledRenders = renderCount;

  scrollWindowTo(5200);

  expect(renderCount).toBe(settledRenders + 1);
  expect(latestWindow?.startIndex).toBeGreaterThan(0);
  expect(latestWindow?.offsetTop).toBeGreaterThan(0);
});

test("после догрузки товаров высота считается по измеренной строке, а не по оценке 520", () => {
  const { rerender } = render(
    <GridProbe itemCount={120} columnCount={2} measuredRows />,
  );
  expect(latestWindow?.rowHeight).toBe(MEASURED_ROW_HEIGHT);

  rerender(<GridProbe itemCount={144} columnCount={2} measuredRows />);

  expect(latestWindow?.rowHeight).toBe(MEASURED_ROW_HEIGHT);
  expect(latestWindow?.totalHeight).toBe(72 * MEASURED_ROW_HEIGHT);
});

test("выключенная виртуализация возвращает пустое окно", () => {
  render(<GridProbe enabled={false} itemCount={240} columnCount={2} />);

  expect(latestWindow).toEqual({
    startIndex: 0,
    endIndex: 0,
    offsetTop: 0,
    totalHeight: 0,
    rowHeight: 520,
  });
});
