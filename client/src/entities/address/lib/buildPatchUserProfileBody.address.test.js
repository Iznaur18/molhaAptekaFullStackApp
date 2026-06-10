import { describe, expect, it } from "vitest";

import { isStructuredAddressEqual } from "./isStructuredAddressEqual.js";
import { buildPatchUserProfileBody } from "../../user/lib/buildPatchUserProfileBody.js";
import { mapUserToEditProfileForm } from "../../user/lib/mapUserToEditProfileForm.js";

describe("isStructuredAddressEqual", () => {
  it("игнорирует пробелы", () => {
    expect(
      isStructuredAddressEqual(
        { city: " Москва ", district: "", street: "ул A", house: "1", flat: "" },
        { city: "Москва", district: "", street: "ул A", house: "1", flat: "" },
      ),
    ).toBe(true);
  });
});

describe("buildPatchUserProfileBody", () => {
  it("не шлёт address-поля, если structured адрес не менялся", () => {
    const user = {
      _id: "1",
      userAddress: "г Москва, ул Ленина, д 1",
      userAddressFlat: "5",
    };
    const form = mapUserToEditProfileForm(user);
    form.userPhoneNumber = "+79001234567";

    const body = buildPatchUserProfileBody(form, {
      initialStructuredAddress: form.structuredAddress,
      initialPhoneNumber: "",
    });

    expect(body.userAddressCity).toBeUndefined();
    expect(body.userAddress).toBeUndefined();
    expect(body.userPhoneNumber).toBe("+79001234567");
  });

  it("шлёт null для address, если structured адрес очищен", () => {
    const initial = {
      city: "Москва",
      district: "",
      street: "ул Ленина",
      house: "1",
      flat: "5",
    };
    const form = mapUserToEditProfileForm({
      _id: "1",
      userAddressCity: "Москва",
      userAddressStreet: "ул Ленина",
      userAddressHouse: "1",
      userAddressFlat: "5",
    });
    form.structuredAddress = {
      city: "",
      district: "",
      street: "",
      house: "",
      flat: "",
    };

    const body = buildPatchUserProfileBody(form, { initialStructuredAddress: initial });

    expect(body.userAddressCity).toBeNull();
    expect(body.userAddressStreet).toBeNull();
    expect(body.userAddress).toBeNull();
  });
});
