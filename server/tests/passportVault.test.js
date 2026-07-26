import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";

import {
  isPassportVaultBlob,
  openPassportStored,
  sealPassportPlain,
} from "../services/passport-vault/passportVaultCrypto.js";
import { resolveSellerBuyerPassportShare } from "../services/order/buyerPassportShare.js";

const SAMPLE_PASSPORT = {
  lastName: "Иванов",
  firstName: "Иван",
  middleName: "Иванович",
  birthDate: new Date("1990-01-15T00:00:00.000Z"),
  series: "1234",
  number: "567890",
  issuedBy: "ОВД района",
  issuedAt: new Date("2010-05-20T00:00:00.000Z"),
  departmentCode: "770-001",
};

const withEnv = (overrides, fn) => {
  const keys = Object.keys(overrides);
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  try {
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    return fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
};

test("seal/open roundtrip with PASSPORT_VAULT_KEK", () => {
  const kek = randomBytes(32).toString("hex");
  withEnv({ PASSPORT_VAULT_KEK: kek, PASSPORT_VAULT_KEY_ID: "v1" }, () => {
    const sealed = sealPassportPlain(SAMPLE_PASSPORT);
    assert.equal(isPassportVaultBlob(sealed), true);
    assert.equal(sealed.series, undefined);
    assert.ok(sealed.ciphertext);

    const opened = openPassportStored(sealed);
    assert.equal(opened.lastName, "Иванов");
    assert.equal(opened.series, "1234");
    assert.equal(opened.number, "567890");
    assert.equal(opened.birthDate.toISOString(), SAMPLE_PASSPORT.birthDate.toISOString());
  });
});

test("openPassportStored accepts legacy plaintext", () => {
  withEnv({ PASSPORT_VAULT_KEK: undefined }, () => {
    const opened = openPassportStored(SAMPLE_PASSPORT);
    assert.equal(opened.series, "1234");
  });
});

test("seal without KEK stores plaintext", () => {
  withEnv({ PASSPORT_VAULT_KEK: undefined }, () => {
    const sealed = sealPassportPlain(SAMPLE_PASSPORT);
    assert.equal(isPassportVaultBlob(sealed), false);
    assert.equal(sealed.series, "1234");
  });
});

test("resolveSellerBuyerPassportShare opens vault blob", () => {
  const kek = randomBytes(32).toString("hex");
  withEnv({ PASSPORT_VAULT_KEK: kek }, () => {
    const sealed = sealPassportPlain(SAMPLE_PASSPORT);
    const share = resolveSellerBuyerPassportShare({
      _id: "order1",
      status: "pending",
      items: [{ status: "pending" }],
      passportShareConsentAt: new Date("2026-07-19T10:00:00.000Z"),
      buyerPassportShare: {
        passport: sealed,
        passportSelfiePhotoUrl: "/uploads/private/x.jpg",
      },
    });
    assert.ok(share);
    assert.equal(share.passport.series, "****");
    assert.equal(share.passport.number, "****7890");
    assert.equal(share.passport.lastName, "Иванов");
  });
});
