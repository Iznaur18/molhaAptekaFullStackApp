import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const {
  normalizeNomenclatureItems,
  sealOneCSecret,
  openOneCSecret,
  maskOneCApiKey,
} = await import("../services/onec/index.js");

describe("onec nomenclature normalize", () => {
  it("parses items envelope", () => {
    const items = normalizeNomenclatureItems({
      items: [
        { guid: "g1", name: "Товар", price: 10, stock: 2 },
        { guid: "", name: "skip", price: 1, stock: 1 },
        { GUID: "g2", Name: "Второй", Price: 5, Stock: 0, IsActive: false },
      ],
    });
    assert.equal(items.length, 2);
    assert.equal(items[0].guid, "g1");
    assert.equal(items[1].isActive, false);
    assert.equal(items[1].stock, 0);
  });
});

describe("onec credentials crypto", () => {
  it("roundtrips seal/open and masks key", () => {
    const sealed = sealOneCSecret("secret-key-1234");
    assert.equal(openOneCSecret(sealed), "secret-key-1234");
    assert.equal(maskOneCApiKey("secret-key-1234"), "••••1234");
  });
});
