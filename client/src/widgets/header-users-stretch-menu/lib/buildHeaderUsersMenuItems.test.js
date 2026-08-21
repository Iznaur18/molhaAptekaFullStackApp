import { describe, expect, it } from "vitest";

import { buildHeaderUsersMenuItems } from "./buildHeaderUsersMenuItems.js";

describe("buildHeaderUsersMenuItems", () => {
  it("returns stretch-menu items matching mobile order", () => {
    const items = buildHeaderUsersMenuItems();

    expect(items.map((item) => item.key)).toEqual([
      "users",
      "terms",
      "faq",
    ]);
    expect(items[0]?.action).toBe("users");
    expect(items[1]?.action).toBe("terms");
    expect(items[2]?.action).toBe("faq");
  });
});
