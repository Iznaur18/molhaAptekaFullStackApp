import { afterEach, describe, expect, it, vi } from "vitest";

import { isPageScrollLockTextField } from "./enableInputFocusPageScrollLock.js";

describe("isPageScrollLockTextField", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("accepts text-like controls", () => {
    const text = document.createElement("input");
    text.type = "text";
    const number = document.createElement("input");
    number.type = "number";
    const tel = document.createElement("input");
    tel.type = "tel";
    const area = document.createElement("textarea");
    const select = document.createElement("select");

    expect(isPageScrollLockTextField(text)).toBe(true);
    expect(isPageScrollLockTextField(number)).toBe(true);
    expect(isPageScrollLockTextField(tel)).toBe(true);
    expect(isPageScrollLockTextField(area)).toBe(true);
    expect(isPageScrollLockTextField(select)).toBe(true);
  });

  it("skips non-text inputs", () => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    const button = document.createElement("input");
    button.type = "button";
    const file = document.createElement("input");
    file.type = "file";

    expect(isPageScrollLockTextField(checkbox)).toBe(false);
    expect(isPageScrollLockTextField(button)).toBe(false);
    expect(isPageScrollLockTextField(file)).toBe(false);
    expect(isPageScrollLockTextField(document.createElement("div"))).toBe(false);
    expect(isPageScrollLockTextField(null)).toBe(false);
  });
});

describe("enableInputFocusPageScrollLock", () => {
  afterEach(() => {
    document.body.replaceChildren();
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    vi.resetModules();
  });

  it("locks body overflow while text input is focused", async () => {
    const { enableInputFocusPageScrollLock } = await import(
      "./enableInputFocusPageScrollLock.js"
    );
    const dispose = enableInputFocusPageScrollLock();

    const input = document.createElement("input");
    input.type = "text";
    document.body.appendChild(input);

    input.focus();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    input.blur();
    await Promise.resolve();
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");

    dispose();
  });

  it("prevents touchmove while text input is focused", async () => {
    const { enableInputFocusPageScrollLock } = await import(
      "./enableInputFocusPageScrollLock.js"
    );
    const dispose = enableInputFocusPageScrollLock();

    const input = document.createElement("input");
    input.type = "text";
    document.body.appendChild(input);
    input.focus();

    const touchEvent = new Event("touchmove", {
      bubbles: true,
      cancelable: true,
    });
    const prevented = !document.dispatchEvent(touchEvent) || touchEvent.defaultPrevented;
    expect(prevented).toBe(true);

    input.blur();
    await Promise.resolve();

    const afterBlur = new Event("touchmove", {
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(afterBlur);
    expect(afterBlur.defaultPrevented).toBe(false);

    dispose();
  });

  it("keeps lock when focus moves between text fields", async () => {
    const { enableInputFocusPageScrollLock } = await import(
      "./enableInputFocusPageScrollLock.js"
    );
    const dispose = enableInputFocusPageScrollLock();

    const first = document.createElement("input");
    first.type = "text";
    const second = document.createElement("input");
    second.type = "text";
    document.body.append(first, second);

    first.focus();
    expect(document.body.style.overflow).toBe("hidden");

    second.focus();
    await Promise.resolve();
    expect(document.body.style.overflow).toBe("hidden");

    second.blur();
    await Promise.resolve();
    expect(document.body.style.overflow).toBe("");

    dispose();
  });
});
