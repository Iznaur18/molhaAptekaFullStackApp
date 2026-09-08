import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  lockBodyScroll,
  lockBodyScrollOverflowOnly,
  releaseStaleBodyScrollIfIdle,
} from "./scrollLock.js";

const body = () => document.body;
const html = () => document.documentElement;

describe("scrollLock", () => {
  beforeEach(() => {
    vi.stubGlobal("scrollTo", vi.fn());
    vi.stubGlobal("scrollY", 0);
  });

  afterEach(() => {
    releaseStaleBodyScrollIfIdle();
    body().removeAttribute("style");
    html().removeAttribute("style");
    vi.unstubAllGlobals();
  });

  it("locks and restores with the fixed strategy", () => {
    vi.stubGlobal("scrollY", 1500);
    const unlock = lockBodyScroll();

    expect(body().style.position).toBe("fixed");
    expect(body().style.top).toBe("-1500px");
    expect(html().style.overflow).toBe("hidden");

    unlock();

    expect(body().style.position).toBe("");
    expect(body().style.overflow).toBe("");
    expect(html().style.overflow).toBe("");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 1500);
  });

  it("keeps the lock until the last nested holder releases", () => {
    const first = lockBodyScroll();
    const second = lockBodyScroll();

    first();
    expect(body().style.position).toBe("fixed");

    second();
    expect(body().style.position).toBe("");
  });

  it("locks and restores with the overflow strategy without touching position", () => {
    const unlock = lockBodyScrollOverflowOnly();

    expect(body().style.overflow).toBe("hidden");
    expect(html().style.overflow).toBe("hidden");
    expect(body().style.position).toBe("");

    unlock();

    expect(body().style.overflow).toBe("");
    expect(html().style.overflow).toBe("");
  });

  it("downgrades to overflow when the fixed lock is released first", () => {
    vi.stubGlobal("scrollY", 900);
    const unlockFixed = lockBodyScroll();
    const unlockOverflow = lockBodyScrollOverflowOnly();

    expect(body().style.position).toBe("fixed");

    unlockFixed();

    expect(body().style.position).toBe("");
    expect(body().style.top).toBe("");
    expect(body().style.width).toBe("");
    expect(body().style.overflow).toBe("hidden");
    expect(html().style.overflow).toBe("hidden");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 900);

    unlockOverflow();

    expect(body().style.overflow).toBe("");
    expect(html().style.overflow).toBe("");
  });

  it("upgrades to fixed and survives the overflow holder leaving first", () => {
    const unlockOverflow = lockBodyScrollOverflowOnly();
    const unlockFixed = lockBodyScroll();

    expect(body().style.position).toBe("fixed");

    unlockOverflow();
    expect(body().style.position).toBe("fixed");
    expect(html().style.overflow).toBe("hidden");

    unlockFixed();
    expect(body().style.position).toBe("");
    expect(body().style.overflow).toBe("");
    expect(html().style.overflow).toBe("");
  });

  it("restores inline styles the page owned before any lock", () => {
    body().style.overflow = "visible";
    body().style.paddingRight = "8px";
    html().style.overflow = "auto";

    const unlockFixed = lockBodyScroll();
    const unlockOverflow = lockBodyScrollOverflowOnly();
    unlockFixed();
    unlockOverflow();

    expect(body().style.overflow).toBe("visible");
    expect(body().style.paddingRight).toBe("8px");
    expect(html().style.overflow).toBe("auto");
  });

  it("ignores a repeated unlock call", () => {
    const unlock = lockBodyScroll();
    const other = lockBodyScroll();

    unlock();
    unlock();

    expect(body().style.position).toBe("fixed");

    other();
    expect(body().style.position).toBe("");
  });
});
