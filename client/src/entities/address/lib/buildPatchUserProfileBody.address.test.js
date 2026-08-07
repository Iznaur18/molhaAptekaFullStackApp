import { describe, expect, it } from "vitest";

import { isDeliveryAddressEqual } from "./isDeliveryAddressEqual.js";
import { buildPatchUserProfileBody } from "../../user/lib/buildPatchUserProfileBody.js";
import { mapUserToEditProfileForm } from "../../user/lib/mapUserToEditProfileForm.js";

describe("isDeliveryAddressEqual", () => {
  it("игнорирует пробелы", () => {
    expect(
      isDeliveryAddressEqual(
        { line: " Москва, ул A, 1 ", flat: "5", fiasId: "", geo: null, selectedFromSuggest: true },
        { line: "Москва, ул A, 1", flat: "5", fiasId: "", geo: null, selectedFromSuggest: true },
      ),
    ).toBe(true);
  });
});

describe("buildPatchUserProfileBody", () => {
  it("не шлёт address-поля, если адрес не менялся", () => {
    const user = {
      _id: "1",
      userAddress: "г Москва, ул Ленина, д 1",
      userAddressFlat: "5",
    };
    const form = mapUserToEditProfileForm(user);
    form.userPhoneNumber = "+79001234567";

    const body = buildPatchUserProfileBody(form, {
      initialDeliveryAddress: form.deliveryAddress,
      initialPhoneNumber: "",
    });

    expect(body.userAddress).toBeUndefined();
    // Телефон владельца идёт через /auth/phone/bind/*, а не через PATCH.
    expect(body.userPhoneNumber).toBeUndefined();
  });

  it("шлёт null для address, если адрес очищен", () => {
    const initial = {
      line: "г Москва, ул Ленина, д 1",
      flat: "5",
      fiasId: "",
      geo: null,
      selectedFromSuggest: true,
    };
    const form = mapUserToEditProfileForm({
      _id: "1",
      userAddress: "г Москва, ул Ленина, д 1",
      userAddressFlat: "5",
    });
    form.deliveryAddress = {
      line: "",
      flat: "",
      fiasId: "",
      geo: null,
      selectedFromSuggest: false,
    };

    const body = buildPatchUserProfileBody(form, { initialDeliveryAddress: initial });

    expect(body.userAddress).toBeNull();
    expect(body.userAddressFlat).toBeNull();
  });

  it("шлёт ник соцсети, а не готовый https URL", () => {
    const form = mapUserToEditProfileForm({ _id: "1" });
    form.socialTelegramUrl = "@demo_user";
    form.socialInstagramUrl = "demo.insta";
    form.userPhoneNumber = "";

    const body = buildPatchUserProfileBody(form, {
      initialDeliveryAddress: form.deliveryAddress,
      initialPhoneNumber: "",
    });

    expect(body.socialTelegramUrl).toBe("@demo_user");
    expect(body.socialInstagramUrl).toBe("demo.insta");
    expect(String(body.socialTelegramUrl)).not.toMatch(/^https?:\/\//i);
  });
});
