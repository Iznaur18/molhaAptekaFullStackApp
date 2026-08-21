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

  it("matches mobile formula for 3 items", () => {
    // 44 + 12 + 3*44 + 2*8 + 8 = 212
    expect(resolveHeaderUsersStretchMenuHeight(3)).toBe(212);
  });
});
