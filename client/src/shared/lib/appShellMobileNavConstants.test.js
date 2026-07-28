import { describe, expect, it } from "vitest";

import { APP_SHELL_TABLET_MAX_PX } from "./appShellLayoutConstants.js";
import { APP_SHELL_MOBILE_NAV_BREAKPOINT_PX } from "./appShellMobileNavConstants.js";

describe("APP_SHELL_MOBILE_NAV_BREAKPOINT_PX", () => {
  it("covers phone + tablet up to desktop exclusive", () => {
    expect(APP_SHELL_MOBILE_NAV_BREAKPOINT_PX).toBe(APP_SHELL_TABLET_MAX_PX);
    expect(APP_SHELL_MOBILE_NAV_BREAKPOINT_PX).toBe(1023);
  });
});
