import { describe, expect, it } from "vitest";

import {
  isSoftKeyboardOpen,
  resolveSoftKeyboardInset,
} from "./enableSoftKeyboardOpenClass.js";

describe("resolveSoftKeyboardInset", () => {
  it("measures the gap under visualViewport", () => {
    expect(resolveSoftKeyboardInset({ height: 420, offsetTop: 0 }, 800)).toBe(380);
  });

  it("accounts for a scrolled visual viewport", () => {
    expect(resolveSoftKeyboardInset({ height: 420, offsetTop: 100 }, 800)).toBe(280);
  });

  it("never goes negative and survives a missing viewport", () => {
    expect(resolveSoftKeyboardInset({ height: 900, offsetTop: 0 }, 800)).toBe(0);
    expect(resolveSoftKeyboardInset(null, 800)).toBe(0);
  });
});

describe("isSoftKeyboardOpen", () => {
  const base = {
    isTextFieldFocused: true,
    isCoarsePointer: true,
    hasVisualViewport: true,
    inset: 0,
    isSettled: false,
  };

  it("stays closed without a focused text field", () => {
    expect(isSoftKeyboardOpen({ ...base, isTextFieldFocused: false, inset: 300 })).toBe(
      false,
    );
  });

  it("opens on a measured keyboard inset", () => {
    expect(isSoftKeyboardOpen({ ...base, inset: 300, isSettled: true })).toBe(true);
  });

  it("opens immediately on touch focus, before the keyboard is measurable", () => {
    expect(isSoftKeyboardOpen(base)).toBe(true);
  });

  it("closes once settled with no measurable inset (Android «спрятать клавиатуру»)", () => {
    expect(isSoftKeyboardOpen({ ...base, isSettled: true })).toBe(false);
  });

  it("ignores focus on desktop pointers", () => {
    expect(isSoftKeyboardOpen({ ...base, isCoarsePointer: false })).toBe(false);
  });

  it("falls back to focus when visualViewport is unavailable", () => {
    expect(
      isSoftKeyboardOpen({ ...base, hasVisualViewport: false, isSettled: true }),
    ).toBe(true);
  });

  it("ignores a sub-threshold inset (URL bar, not a keyboard)", () => {
    expect(isSoftKeyboardOpen({ ...base, inset: 30, isSettled: true })).toBe(false);
  });
});
