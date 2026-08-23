import { describe, expect, it } from "vitest";

import { isUserSavedAddressEqual } from "./isUserSavedAddressesEqual.js";
import { buildPatchUserProfileBody } from "../../user/lib/buildPatchUserProfileBody.js";
import { mapUserToEditProfileForm } from "../../user/lib/mapUserToEditProfileForm.js";

describe("isUserSavedAddressEqual", () => {
  it("игнорирует пробелы", () => {
    expect(
      isUserSavedAddressEqual(
        {
          id: "a1",
          label: "",
          line: " Москва, ул A, 1 ",
          flat: "5",
          fiasId: "",
          geo: null,
          selectedFromSuggest: true,
          isDefault: true,
        },
        {
          id: "a1",
          label: "",
          line: "Москва, ул A, 1",
          flat: "5",
          fiasId: "",
          geo: null,
          selectedFromSuggest: true,
          isDefault: true,
        },
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
      initialSavedAddresses: form.savedAddresses,
      initialPhoneNumber: "",
    });

    expect(body.userAddresses).toBeUndefined();
    expect(body.userPhoneNumber).toBeUndefined();
  });

  it("шлёт пустой массив address, если адреса удалены", () => {
    const initial = [
      {
        id: "a1",
        label: "",
        line: "г Москва, ул Ленина, д 1",
        flat: "5",
        fiasId: "",
        geo: null,
        selectedFromSuggest: true,
        isDefault: true,
      },
    ];
    const form = mapUserToEditProfileForm({
      _id: "1",
      userAddress: "г Москва, ул Ленина, д 1",
      userAddressFlat: "5",
    });
    form.savedAddresses = [];

    const body = buildPatchUserProfileBody(form, { initialSavedAddresses: initial });

    expect(body.userAddresses).toEqual([]);
  });

  it("шлёт flat как пустую строку, не null", () => {
    const form = mapUserToEditProfileForm({
      _id: "1",
      userAddress: "г Москва, ул Ленина, д 1",
    });
    form.savedAddresses = [
      ...form.savedAddresses,
      {
        id: "addr-new",
        label: "Дача",
        line: "г Москва, ул Пушкина, д 2",
        flat: "",
        fiasId: "",
        geo: { lat: 55.75, lon: 37.62 },
        selectedFromSuggest: true,
        isDefault: false,
      },
    ];

    const body = buildPatchUserProfileBody(form, {
      initialSavedAddresses: mapUserToEditProfileForm({
        _id: "1",
        userAddress: "г Москва, ул Ленина, д 1",
      }).savedAddresses,
    });

    expect(body.userAddresses).toEqual([
      {
        id: expect.any(String),
        label: null,
        line: "г Москва, ул Ленина, д 1",
        flat: "",
        isDefault: true,
      },
      {
        id: "addr-new",
        label: "Дача",
        line: "г Москва, ул Пушкина, д 2",
        flat: "",
        isDefault: false,
      },
    ]);
  });

  it("шлёт ник соцсети, а не готовый https URL", () => {
    const form = mapUserToEditProfileForm({ _id: "1" });
    form.socialTelegramUrl = "@demo_user";
    form.socialInstagramUrl = "demo.insta";
    form.userPhoneNumber = "";

    const body = buildPatchUserProfileBody(form, {
      initialSavedAddresses: form.savedAddresses,
      initialPhoneNumber: "",
    });

    expect(body.socialTelegramUrl).toBe("@demo_user");
    expect(body.socialInstagramUrl).toBe("demo.insta");
    expect(String(body.socialTelegramUrl)).not.toMatch(/^https?:\/\//i);
  });
});
