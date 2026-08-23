import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ensureSingleDefaultUserSavedAddress,
  userSavedAddressDuplicateKey,
  userAddressesPatchFieldSchema,
  userSavedAddressesFromProfile,
  USER_ADDRESS_PATCH_CONFLICT_MESSAGE,
} from "../src/userAddresses.js";
import { updateProfileBodySchema } from "../src/userProfile.js";

describe("userAddresses contract", () => {
  it("builds duplicate key case-insensitively", () => {
    assert.equal(
      userSavedAddressDuplicateKey(" Москва, ул. A, 1 ", "5"),
      userSavedAddressDuplicateKey("москва, ул. a, 1", "5"),
    );
  });

  it("migrates legacy single address", () => {
    const list = userSavedAddressesFromProfile({
      userAddress: "Москва, Тверская 1",
      userAddressFlat: "12",
      userAddressFiasId: "fias-1",
      userAddressGeo: { lat: 55.75, lon: 37.62 },
    });

    assert.equal(list.length, 1);
    assert.equal(list[0].line, "Москва, Тверская 1");
    assert.equal(list[0].flat, "12");
    assert.equal(list[0].isDefault, true);
  });

  it("rejects duplicate addresses in patch schema", () => {
    const parsed = userAddressesPatchFieldSchema.safeParse([
      {
        id: "a1",
        label: "Дом",
        line: "Москва, Тверская 1",
        flat: "",
        isDefault: true,
      },
      {
        id: "a2",
        label: "Работа",
        line: "москва, тверская 1",
        flat: "",
        isDefault: false,
      },
    ]);

    assert.equal(parsed.success, false);
  });

  it("ensures one default address", () => {
    const normalized = ensureSingleDefaultUserSavedAddress([
      { line: "A", isDefault: false },
      { line: "B", isDefault: false },
    ]);

    assert.equal(normalized[0].isDefault, true);
    assert.equal(normalized[1].isDefault, false);
  });

  it("rejects legacy and userAddresses in one patch body", () => {
    const parsed = updateProfileBodySchema.safeParse({
      userAddress: "Москва, Тверская 1",
      userAddresses: [
        {
          id: "a1",
          line: "Москва, Тверская 1",
          flat: "",
          isDefault: true,
        },
      ],
    });

    assert.equal(parsed.success, false);
    if (!parsed.success) {
      assert.ok(
        parsed.error.issues.some(
          (issue) => issue.message === USER_ADDRESS_PATCH_CONFLICT_MESSAGE,
        ),
      );
    }
  });
});
