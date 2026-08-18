import { afterEach, describe, expect, it } from "vitest";

import { lockBodyScroll, releaseStaleBodyScrollIfIdle } from "./scrollLock.js";

describe("releaseStaleBodyScrollIfIdle", () => {
  afterEach(() => {
    document.body.replaceChildren();
    document.body.removeAttribute("style");
    document.documentElement.removeAttribute("style");
    releaseStaleBodyScrollIfIdle();
  });

  it("clears leaked position:fixed when no modal is open", () => {
    lockBodyScroll();
    expect(document.body.style.position).toBe("fixed");

    releaseStaleBodyScrollIfIdle();

    expect(document.body.style.position).toBe("");
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps lock while an aria-modal dialog exists", () => {
    lockBodyScroll();
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    document.body.append(dialog);

    releaseStaleBodyScrollIfIdle();

    expect(document.body.style.position).toBe("fixed");
  });
});
