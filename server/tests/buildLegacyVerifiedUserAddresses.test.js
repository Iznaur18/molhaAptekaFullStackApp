import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildLegacyVerifiedUserAddresses,
  mapStoredUserSavedAddressItem,
} from "../services/user/buildLegacyVerifiedUserAddresses.js";

const verified = {
  displayAddress: "Москва, Тверская 1",
  flat: "12",
  city: "Москва",
  district: "",
  street: "Тверская",
  house: "1",
  fiasId: "fias-1",
  geo: { lat: 55.75, lon: 37.62 },
  regionCode: "77",
};

describe("buildLegacyVerifiedUserAddresses", () => {
  it("creates single default address when list empty", () => {
    const next = buildLegacyVerifiedUserAddresses([], verified);
    assert.equal(next.length, 1);
    assert.equal(next[0].line, verified.displayAddress);
    assert.equal(next[0].isDefault, true);
  });

  it("updates only default address when multiple stored", () => {
    const existing = [
      {
        id: "home",
        label: "Дом",
        line: "Старый адрес",
        flat: "",
        isDefault: true,
      },
      {
        id: "work",
        label: "Работа",
        line: "Офис",
        flat: "5",
        isDefault: false,
      },
    ];

    const next = buildLegacyVerifiedUserAddresses(existing, verified);

    assert.equal(next.length, 2);
    assert.equal(next[0].line, verified.displayAddress);
    assert.equal(next[0].id, "home");
    assert.equal(next[1].line, "Офис");
  });

  it("maps stored item safely", () => {
    const mapped = mapStoredUserSavedAddressItem({
      id: "",
      line: "A",
      isDefault: true,
    });
    assert.equal(mapped.id, "legacy-default");
    assert.equal(mapped.line, "A");
  });
});
