import { describe, expect, it } from "vitest";

import { addressStructuredValueFromUser } from "./addressStructuredValueFromUser.js";

describe("addressStructuredValueFromUser", () => {
  it("возвращает structured поля, если city сохранён", () => {
    expect(
      addressStructuredValueFromUser({
        userAddressCity: "Москва",
        userAddressDistrict: "ЦАО",
        userAddressStreet: "ул Ленина",
        userAddressHouse: "1",
        userAddressFlat: "5",
      }),
    ).toEqual({
      city: "Москва",
      district: "ЦАО",
      street: "ул Ленина",
      house: "1",
      flat: "5",
    });
  });

  it("не парсит legacy userAddress без structured city", () => {
    expect(
      addressStructuredValueFromUser({
        userAddress: "г Москва, ул Ленина, д 1",
        userAddressFlat: "5",
      }),
    ).toEqual({
      city: "",
      district: "",
      street: "",
      house: "",
      flat: "",
    });
  });
});
