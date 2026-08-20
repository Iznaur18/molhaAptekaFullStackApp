import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { loadThemePreference, saveThemePreference } from "./themePreferenceStorage.js";

describe("themePreferenceStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("defaults to dark when empty", () => {
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

  it("migrates legacy system to dark", () => {
    localStorage.setItem("app-theme-preference", "system");
    expect(loadThemePreference()).toBe("dark");
    expect(localStorage.getItem("app-theme-preference")).toBe("dark");
  });

  it("keeps stored dark as the hand-crafted dark theme", () => {
    localStorage.setItem("app-theme-preference", "dark");
    expect(loadThemePreference()).toBe("dark");
    expect(localStorage.getItem("app-theme-preference")).toBe("dark");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem("app-theme-preference", "neon");
    expect(loadThemePreference()).toBe("dark");
  });
});
