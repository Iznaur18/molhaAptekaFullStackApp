import { describe, expect, it, vi } from "vitest";

import { openProductInstagramPost } from "./openProductInstagramPost.js";

describe("openProductInstagramPost", () => {
  it("opens instagram post in a new tab", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    openProductInstagramPost("https://www.instagram.com/p/ABC123/");

    expect(openSpy).toHaveBeenCalledWith(
      "https://www.instagram.com/p/ABC123/",
      "_blank",
      "noopener,noreferrer",
    );

    openSpy.mockRestore();
  });
});
