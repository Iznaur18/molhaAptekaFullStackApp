import { describe, expect, it, beforeEach, afterEach } from "vitest";

import {
  loadThemePreference,
  saveThemePreference,
} from "./themePreferenceStorage.js";

describe("themePreferenceStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("defaults to custom when empty", () => {
    expect(loadThemePreference()).toBe("custom");
  });

  it("persists and loads preference", () => {
    saveThemePreference("light");
    expect(loadThemePreference()).toBe("light");
    saveThemePreference("custom");
    expect(loadThemePreference()).toBe("custom");
  });

  it("migrates legacy system/dark to custom", () => {
    localStorage.setItem("app-theme-preference", "system");
    expect(loadThemePreference()).toBe("custom");
    expect(localStorage.getItem("app-theme-preference")).toBe("custom");

    localStorage.setItem("app-theme-preference", "dark");
    expect(loadThemePreference()).toBe("custom");
    expect(localStorage.getItem("app-theme-preference")).toBe("custom");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem("app-theme-preference", "neon");
    expect(loadThemePreference()).toBe("custom");
  });
});
