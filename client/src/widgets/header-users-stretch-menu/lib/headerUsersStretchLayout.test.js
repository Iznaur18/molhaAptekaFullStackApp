import { describe, expect, it } from "vitest";

import {
  HEADER_USERS_STRETCH_BUTTON_SIZE_PX,
  resolveHeaderUsersStretchMenuHeight,
} from "./headerUsersStretchLayout.js";

describe("resolveHeaderUsersStretchMenuHeight", () => {
  it("returns circle size when empty", () => {
    expect(resolveHeaderUsersStretchMenuHeight(0)).toBe(
      HEADER_USERS_STRETCH_BUTTON_SIZE_PX,
    );
  });

  it("matches mobile formula for 4 items", () => {
    // 44 + 12 + 4*44 + 3*8 + 8 = 264
    expect(resolveHeaderUsersStretchMenuHeight(4)).toBe(264);
  });
});
