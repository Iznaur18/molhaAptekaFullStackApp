import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import {
  loadThemePreference,
  resolveThemePreferenceFromSystem,
  saveThemePreference,
} from "./themePreferenceStorage.js";

describe("themePreferenceStorage", () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let matchMediaMock;

  beforeEach(() => {
    localStorage.clear();
    matchMediaMock = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal("matchMedia", matchMediaMock);
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("defaults to custom when OS is light", () => {
    matchMediaMock.mockImplementation((query) => ({
      matches: false,
      media: query,
    }));
    expect(resolveThemePreferenceFromSystem()).toBe("custom");
    expect(loadThemePreference()).toBe("custom");
  });

  it("defaults to dark when OS is dark", () => {
    matchMediaMock.mockImplementation((query) => ({
      matches: String(query).includes("prefers-color-scheme: dark"),
      media: query,
    }));
    expect(resolveThemePreferenceFromSystem()).toBe("dark");
    expect(loadThemePreference()).toBe("dark");
  });

  it("persists and loads preference", () => {
    saveThemePreference("light");
    expect(loadThemePreference()).toBe("light");
    saveThemePreference("dark");
    expect(loadThemePreference()).toBe("dark");
    saveThemePreference("custom");
    expect(loadThemePreference()).toBe("custom");
  });

  it("legacy system follows OS without rewriting storage", () => {
    localStorage.setItem("app-theme-preference", "system");
    matchMediaMock.mockImplementation((query) => ({
      matches: String(query).includes("prefers-color-scheme: dark"),
      media: query,
    }));
    expect(loadThemePreference()).toBe("dark");
    expect(localStorage.getItem("app-theme-preference")).toBe("system");
  });

  it("keeps stored dark as the hand-crafted dark theme", () => {
    localStorage.setItem("app-theme-preference", "dark");
    expect(loadThemePreference()).toBe("dark");
    expect(localStorage.getItem("app-theme-preference")).toBe("dark");
  });

  it("invalid stored values fall back to OS", () => {
    localStorage.setItem("app-theme-preference", "neon");
    matchMediaMock.mockImplementation(() => ({ matches: false, media: "" }));
    expect(loadThemePreference()).toBe("custom");
  });
});
