import { describe, expect, it } from "vitest";

import {
  resolveWebContentMaxWidth,
  WEB_APP_SHELL_MAX_WIDTH_PX,
  WEB_CONTENT_MAX_WIDTH_LARGE_PX,
  WEB_CONTENT_MAX_WIDTH_MEDIUM_TABLET_PX,
  WEB_CONTENT_MAX_WIDTH_SMALL_TABLET_PX,
  WEB_CONTENT_MAX_WIDTH_WIDE_PX,
} from "./appShellLayoutConstants.js";
import { resolveAppViewportWidth } from "./resolveAppViewportWidth.js";

describe("resolveWebContentMaxWidth", () => {
  it("keeps phone widths uncapped", () => {
    expect(resolveWebContentMaxWidth(390)).toBe(390);
    expect(resolveWebContentMaxWidth(599)).toBe(599);
  });

  it("caps tablet tiers like mobile", () => {
    expect(resolveWebContentMaxWidth(600)).toBe(WEB_CONTENT_MAX_WIDTH_SMALL_TABLET_PX);
    expect(resolveWebContentMaxWidth(750)).toBe(WEB_CONTENT_MAX_WIDTH_SMALL_TABLET_PX);
    expect(resolveWebContentMaxWidth(768)).toBe(WEB_CONTENT_MAX_WIDTH_MEDIUM_TABLET_PX);
    expect(resolveWebContentMaxWidth(1000)).toBe(WEB_CONTENT_MAX_WIDTH_MEDIUM_TABLET_PX);
    expect(resolveWebContentMaxWidth(1024)).toBe(WEB_CONTENT_MAX_WIDTH_LARGE_PX);
    expect(resolveWebContentMaxWidth(1279)).toBe(WEB_CONTENT_MAX_WIDTH_LARGE_PX);
    expect(resolveWebContentMaxWidth(1280)).toBe(WEB_CONTENT_MAX_WIDTH_WIDE_PX);
    expect(resolveWebContentMaxWidth(1920)).toBe(WEB_CONTENT_MAX_WIDTH_WIDE_PX);
  });
});

describe("resolveAppViewportWidth", () => {
  it("clamps wide desktop viewport to shell max width", () => {
    expect(resolveAppViewportWidth(1920)).toBe(WEB_APP_SHELL_MAX_WIDTH_PX);
  });

  it("applies tablet content caps", () => {
    expect(resolveAppViewportWidth(390)).toBe(390);
    expect(resolveAppViewportWidth(800)).toBe(WEB_CONTENT_MAX_WIDTH_MEDIUM_TABLET_PX);
  });

  it("falls back to shell max for invalid input", () => {
    expect(resolveAppViewportWidth(Number.NaN)).toBe(WEB_APP_SHELL_MAX_WIDTH_PX);
    expect(resolveAppViewportWidth(0)).toBe(WEB_APP_SHELL_MAX_WIDTH_PX);
  });
});
