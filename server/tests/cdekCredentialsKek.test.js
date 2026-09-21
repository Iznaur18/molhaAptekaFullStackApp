import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

process.env.JWT_SECRET ||= "test-secret-for-cdek-kek";

const { UserModel } = await import("../models/index.js");
const { cdekSecretNeedsReseal, openCdekSecret, sealCdekSecret } =
  await import("../services/shipping/cdek/cdekCredentialsCrypto.js");
const { resolveSellerCdekCredentials } =
  await import("../services/shipping/cdek/cdekSellerCredentials.js");

const KEK = "ab".repeat(32);

describe("ключ шифрования секретов СДЭК", () => {
  afterEach(() => {
    delete process.env.CDEK_CREDENTIALS_KEK;
    mock.restoreAll();
  });

  it("без KEK шифрует запасным ключом и сам же открывает", () => {
    const blob = sealCdekSecret("sec");
    assert.equal(blob.kid, "jwt");
    assert.equal(openCdekSecret(blob), "sec");
    assert.equal(cdekSecretNeedsReseal(blob), false);
  });

  it("старая запись без kid открывается и после появления KEK", () => {
    const legacy = sealCdekSecret("sec");
    delete legacy.kid;
    process.env.CDEK_CREDENTIALS_KEK = KEK;

    assert.equal(openCdekSecret(legacy), "sec");
    assert.equal(cdekSecretNeedsReseal(legacy), true);
  });

  it("с KEK новое шифруется им, а без KEK такую запись не открыть", () => {
    process.env.CDEK_CREDENTIALS_KEK = KEK;
    const blob = sealCdekSecret("sec");
    assert.equal(blob.kid, "kek");
    assert.equal(openCdekSecret(blob), "sec");

    delete process.env.CDEK_CREDENTIALS_KEK;
    assert.throws(() => openCdekSecret(blob), /CDEK_CREDENTIALS_KEK/);
  });

  it("при чтении ключей продавца старая запись перешифровывается на KEK", async () => {
    const legacy = sealCdekSecret("sec");
    process.env.CDEK_CREDENTIALS_KEK = KEK;
    mock.method(UserModel, "findById", () => ({
      select: () => ({
        lean: async () => ({
          cdekIntegration: {
            account: "acc",
            secureSealed: legacy,
            environment: "prod",
          },
        }),
      }),
    }));
    const updates = [];
    mock.method(UserModel, "updateOne", async (filter, update) => {
      updates.push(update);
      return { modifiedCount: 1 };
    });

    const credentials = await resolveSellerCdekCredentials("64b000000000000000000001");

    assert.equal(credentials.secure, "sec");
    assert.equal(updates.length, 1);
    const resealed = updates[0].$set["cdekIntegration.secureSealed"];
    assert.equal(resealed.kid, "kek");
    assert.equal(openCdekSecret(resealed), "sec");
  });
});
