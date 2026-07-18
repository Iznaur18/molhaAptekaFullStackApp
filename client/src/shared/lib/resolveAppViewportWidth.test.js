import { describe, expect, it } from "vitest";

import { WEB_APP_SHELL_MAX_WIDTH_PX } from "./appShellLayoutConstants.js";
import { resolveAppViewportWidth } from "./resolveAppViewportWidth.js";

describe("resolveAppViewportWidth", () => {
  it("clamps wide desktop viewport to shell max width", () => {
    expect(resolveAppViewportWidth(1920)).toBe(WEB_APP_SHELL_MAX_WIDTH_PX);
  });

  it("keeps phone and tablet widths as-is when below shell max", () => {
    expect(resolveAppViewportWidth(390)).toBe(390);
    expect(resolveAppViewportWidth(800)).toBe(800);
  });

  it("falls back to shell max for invalid input", () => {
    expect(resolveAppViewportWidth(Number.NaN)).toBe(WEB_APP_SHELL_MAX_WIDTH_PX);
    expect(resolveAppViewportWidth(0)).toBe(WEB_APP_SHELL_MAX_WIDTH_PX);
  });
});
