import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { scrollWindowToTopAnimated } from "./scrollWindowToTopAnimated.js";

beforeEach(() => {
  vi.stubGlobal("scrollY", 1200);
  vi.stubGlobal(
    "scrollTo",
    vi.fn((x, y) => {
      vi.stubGlobal("scrollY", typeof y === "number" ? y : 0);
    }),
  );
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  Object.defineProperty(document.documentElement, "scrollTop", {
    configurable: true,
    writable: true,
    value: 1200,
  });
  Object.defineProperty(document.body, "scrollTop", {
    configurable: true,
    writable: true,
    value: 1200,
  });

  let now = 0;
  vi.stubGlobal("performance", { now: () => now });
  vi.stubGlobal("requestAnimationFrame", (cb) => {
    now += 80;
    return setTimeout(() => cb(now), 0);
  });
  vi.stubGlobal("cancelAnimationFrame", (id) => clearTimeout(id));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test("scrollWindowToTopAnimated animates toward top", async () => {
  vi.useFakeTimers();
  scrollWindowToTopAnimated();
  await vi.runAllTimersAsync();
  expect(window.scrollY).toBe(0);
});

test("scrollWindowToTopAnimated jumps when reduced motion", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  scrollWindowToTopAnimated();
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});
