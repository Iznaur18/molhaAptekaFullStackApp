import { afterEach, describe, expect, it, vi } from "vitest";

import {
  enableAndroidFocusFieldScroll,
  isAndroidUserAgent,
  resolveAndroidVisibleBottom,
  scrollAndroidFieldIntoView,
} from "./enableAndroidFocusFieldScroll.js";

describe("isAndroidUserAgent", () => {
  it("detects Android", () => {
    expect(isAndroidUserAgent("Mozilla/5.0 (Linux; Android 14; SM-A156B)")).toBe(
      true,
    );
    expect(isAndroidUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).toBe(
      false,
    );
  });
});

describe("resolveAndroidVisibleBottom", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses visualViewport when keyboard inset is present", () => {
    vi.stubGlobal("innerHeight", 800);
    vi.stubGlobal("visualViewport", { height: 420, offsetTop: 0 });
    expect(resolveAndroidVisibleBottom(false)).toBe(400);
  });

  it("assumes keyboard band when requested and inset missing", () => {
    vi.stubGlobal("innerHeight", 800);
    vi.stubGlobal("visualViewport", { height: 800, offsetTop: 0 });
    expect(resolveAndroidVisibleBottom(true)).toBeCloseTo(800 * 0.52 - 20, 5);
  });
});

describe("scrollAndroidFieldIntoView", () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("smooth-scrolls scroll parent when field is covered", () => {
    vi.stubGlobal("innerHeight", 800);
    vi.stubGlobal("visualViewport", { height: 800, offsetTop: 0 });

    const scroller = document.createElement("div");
    const input = document.createElement("input");
    input.type = "password";
    scroller.appendChild(input);
    document.body.appendChild(scroller);

    Object.defineProperty(scroller, "scrollHeight", { value: 1200, configurable: true });
    Object.defineProperty(scroller, "clientHeight", { value: 400, configurable: true });
    Object.defineProperty(scroller, "scrollTop", {
      value: 0,
      writable: true,
      configurable: true,
    });
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;

    vi.spyOn(window, "getComputedStyle").mockImplementation((el) => {
      if (el === scroller) {
        return /** @type {CSSStyleDeclaration} */ ({ overflowY: "auto" });
      }
      return /** @type {CSSStyleDeclaration} */ ({ overflowY: "visible" });
    });
    vi.spyOn(input, "getBoundingClientRect").mockReturnValue({
      top: 450,
      bottom: 498,
      left: 0,
      right: 100,
      width: 100,
      height: 48,
      x: 0,
      y: 450,
      toJSON: () => ({}),
    });

    scrollAndroidFieldIntoView(input, { assumeKeyboard: true });

    expect(scrollBy).toHaveBeenCalled();
    expect(scrollBy.mock.calls[0][0].behavior).toBe("smooth");
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);
  });
});

describe("enableAndroidFocusFieldScroll", () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it("is a no-op on non-Android", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone)" });
    const dispose = enableAndroidFocusFieldScroll();
    const input = document.createElement("input");
    input.type = "text";
    input.scrollIntoView = vi.fn();
    document.body.appendChild(input);
    input.focus();
    expect(input.scrollIntoView).not.toHaveBeenCalled();
    dispose();
  });

  it("is wired from client bootstrap", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const main = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/main.jsx"),
      "utf8",
    );
    expect(main).toMatch(/enableAndroidFocusFieldScroll/);
  });
});
