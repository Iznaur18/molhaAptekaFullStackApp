import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { useHorizontalPointerDragScroll } from "./useHorizontalPointerDragScroll.js";

/** @type {Array<(entries: Array<{ isIntersecting: boolean }>) => void>} */
let intersectionCallbacks;
/** @type {Map<number, (timestamp: number) => void>} */
let pendingFrames;

function stubPointerEnvironment({ finePointer, reducedMotion = false }) {
  vi.stubGlobal("matchMedia", (query) => ({
    matches: query.includes("prefers-reduced-motion") ? reducedMotion : finePointer,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

function BadgesRow({ overflow }) {
  const { ref, dragScrollProps } = useHorizontalPointerDragScroll();

  const setNode = (node) => {
    if (node) {
      // jsdom не раскладывает, поэтому ширины ряда задаём руками.
      Object.defineProperty(node, "clientWidth", { configurable: true, value: 100 });
      Object.defineProperty(node, "scrollWidth", {
        configurable: true,
        value: overflow ? 240 : 100,
      });
    }
    ref(node);
  };

  return (
    <div ref={setNode} {...dragScrollProps}>
      <span>badge</span>
    </div>
  );
}

function setRowVisible(isIntersecting) {
  act(() => {
    intersectionCallbacks.forEach((callback) => callback([{ isIntersecting }]));
  });
}

function runFrame(timestamp) {
  const frames = [...pendingFrames.values()];
  pendingFrames.clear();
  frames.forEach((callback) => callback(timestamp));
}

beforeEach(() => {
  intersectionCallbacks = [];
  pendingFrames = new Map();
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
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback) {
        intersectionCallbacks.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("на тач-устройстве цикл автопрокрутки не запускается", () => {
  stubPointerEnvironment({ finePointer: false });
  render(<BadgesRow overflow />);
  setRowVisible(true);

  expect(pendingFrames.size).toBe(0);
});

test("пока ряд не виден, цикла нет", () => {
  stubPointerEnvironment({ finePointer: true });
  render(<BadgesRow overflow />);

  expect(pendingFrames.size).toBe(0);
});

test("без переполнения цикла нет", () => {
  stubPointerEnvironment({ finePointer: true });
  render(<BadgesRow overflow={false} />);
  setRowVisible(true);

  expect(pendingFrames.size).toBe(0);
});

test("при «уменьшении движения» цикла нет", () => {
  stubPointerEnvironment({ finePointer: true, reducedMotion: true });
  render(<BadgesRow overflow />);
  setRowVisible(true);

  expect(pendingFrames.size).toBe(0);
});

test("видимый переполненный ряд крутится, а ушедший из виду — останавливается", () => {
  stubPointerEnvironment({ finePointer: true });
  render(<BadgesRow overflow />);
  setRowVisible(true);

  expect(pendingFrames.size).toBe(1);
  runFrame(16);
  runFrame(32);
  expect(pendingFrames.size).toBe(1);

  setRowVisible(false);
  expect(pendingFrames.size).toBe(0);

  runFrame(48);
  expect(pendingFrames.size).toBe(0);
});

test("при размонтировании цикл отменяется", () => {
  stubPointerEnvironment({ finePointer: true });
  const { unmount } = render(<BadgesRow overflow />);
  setRowVisible(true);
  expect(pendingFrames.size).toBe(1);

  unmount();

  expect(pendingFrames.size).toBe(0);
});
