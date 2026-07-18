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

  it("defaults to system when empty", () => {
    expect(loadThemePreference()).toBe("system");
  });

  it("persists and loads preference", () => {
    saveThemePreference("dark");
    expect(loadThemePreference()).toBe("dark");
    saveThemePreference("light");
    expect(loadThemePreference()).toBe("light");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem("app-theme-preference", "neon");
    expect(loadThemePreference()).toBe("system");
  });
});
