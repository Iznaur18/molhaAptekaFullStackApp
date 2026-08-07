import { afterEach, describe, expect, it } from "vitest";

import {
  enableInputFocusPageScrollLock,
  isPageScrollLockTextField,
} from "./enableInputFocusPageScrollLock.js";

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
    document.body.append(text, number, tel, area, select);

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
    document.body.append(checkbox, button, file);

    expect(isPageScrollLockTextField(checkbox)).toBe(false);
    expect(isPageScrollLockTextField(button)).toBe(false);
    expect(isPageScrollLockTextField(file)).toBe(false);
    expect(isPageScrollLockTextField(document.createElement("div"))).toBe(false);
    expect(isPageScrollLockTextField(null)).toBe(false);
  });

  it("skips disconnected text fields", () => {
    const input = document.createElement("input");
    input.type = "text";
    document.body.appendChild(input);
    expect(isPageScrollLockTextField(input)).toBe(true);
    input.remove();
    expect(isPageScrollLockTextField(input)).toBe(false);
  });
});

describe("enableInputFocusPageScrollLock", () => {
  afterEach(() => {
    document.body.replaceChildren();
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  });

  it("does not lock scroll while text input is focused", () => {
    const dispose = enableInputFocusPageScrollLock();

    const input = document.createElement("input");
    input.type = "text";
    document.body.appendChild(input);
    input.focus();

    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");

    const touchEvent = new Event("touchmove", {
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(touchEvent);
    expect(touchEvent.defaultPrevented).toBe(false);

    dispose();
  });
});
