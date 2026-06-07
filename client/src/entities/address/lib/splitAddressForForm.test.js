import { describe, expect, it } from "vitest";

import { splitAddressForForm } from "./splitAddressForForm.js";

describe("splitAddressForForm", () => {
  it("returns trimmed line and flat", () => {
    expect(splitAddressForForm("  Москва  ", " 12 ")).toEqual({
      line: "Москва",
      flat: "12",
    });
  });

  it("strips flat suffix from line", () => {
    expect(splitAddressForForm("ул. Мира 1, кв 12", "12")).toEqual({
      line: "ул. Мира 1",
      flat: "12",
    });
    expect(splitAddressForForm("ул. Мира 1, кв. 12", "12")).toEqual({
      line: "ул. Мира 1",
      flat: "12",
    });
    expect(splitAddressForForm("ул. Мира 1, квартира 12", "12")).toEqual({
      line: "ул. Мира 1",
      flat: "12",
    });
  });

  it("keeps line unchanged when suffix does not match", () => {
    expect(splitAddressForForm("ул. Мира 1", "12")).toEqual({
      line: "ул. Мира 1",
      flat: "12",
    });
  });
});
