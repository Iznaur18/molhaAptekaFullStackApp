import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

process.env.JWT_SECRET ||= "test-secret-for-cdek-credentials";

const { sealCdekSecret, openCdekSecret, isCdekSealedSecret } =
  await import("../services/shipping/cdek/cdekCredentialsCrypto.js");
const { getCdekToken, forgetCdekToken, verifyCdekCredentials } =
  await import("../services/shipping/cdek/cdekClient.js");
const { readCdekConnectionState } =
  await import("../services/shipping/cdek/cdekSellerCredentials.js");

describe("ключи СДЭК: шифрование", () => {
  it("секрет расшифровывается обратно и не хранится открытым", () => {
    const sealed = sealCdekSecret("PjLZkKBHEiLK3YsjtNrt3TGNG0ahs3kG");
    assert.ok(isCdekSealedSecret(sealed));
    assert.ok(!JSON.stringify(sealed).includes("PjLZkKBH"));
    assert.equal(openCdekSecret(sealed), "PjLZkKBHEiLK3YsjtNrt3TGNG0ahs3kG");
  });

  it("порченый блоб не расшифровывается молча", () => {
    const sealed = sealCdekSecret("secret");
    assert.throws(() => openCdekSecret({ ...sealed, ciphertext: "0000" }));
    assert.throws(() => openCdekSecret("plain-text"));
  });
});

describe("состояние подключения СДЭК", () => {
  it("маскирует account и не отдаёт секрет", () => {
    const state = readCdekConnectionState({
      account: "EMscd6r9JnFiQ3bLoyjJY6eM78JrJceI",
      secureSealed: sealCdekSecret("secret"),
      environment: "test",
      validatedAt: null,
      lastError: "",
    });
    assert.equal(state.connected, true);
    assert.equal(state.environment, "test");
    assert.equal(state.accountMasked, "••••JceI");
    assert.ok(!JSON.stringify(state).includes("secret"));
  });

  it("без ключей считается неподключённым", () => {
    const state = readCdekConnectionState(null);
    assert.equal(state.connected, false);
    assert.equal(state.environment, "prod");
    assert.equal(state.accountMasked, "");
  });
});

describe("клиент СДЭК: токен", () => {
  const credentials = { account: "acc-1", secure: "sec-1", environment: "test" };
  const realFetch = globalThis.fetch;
  let calls = 0;

  before(() => {
    globalThis.fetch = async (url) => {
      const href = String(url);
      if (href.endsWith("/oauth/token")) {
        calls += 1;
        return new Response(
          JSON.stringify({ access_token: `token-${calls}`, expires_in: 3600 }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      throw new Error(`неожиданный запрос: ${href}`);
    };
  });

  after(() => {
    globalThis.fetch = realFetch;
    forgetCdekToken(credentials);
  });

  it("берётся один раз и переиспользуется из кэша", async () => {
    forgetCdekToken(credentials);
    calls = 0;
    const first = await getCdekToken(credentials);
    const second = await getCdekToken(credentials);
    assert.equal(first, second);
    assert.equal(calls, 1, "второй вызов должен взять токен из кэша");
  });

  it("у разных продавцов токены не смешиваются", async () => {
    forgetCdekToken(credentials);
    calls = 0;
    const a = await getCdekToken({ ...credentials, account: "seller-a" });
    const b = await getCdekToken({ ...credentials, account: "seller-b" });
    assert.notEqual(a, b);
    assert.equal(calls, 2);
    forgetCdekToken({ ...credentials, account: "seller-a" });
    forgetCdekToken({ ...credentials, account: "seller-b" });
  });
});

describe("клиент СДЭК: чужой ключ", () => {
  const realFetch = globalThis.fetch;

  before(() => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "invalid_client" }), { status: 401 });
  });

  after(() => {
    globalThis.fetch = realFetch;
  });

  it("отвечает понятной ошибкой, а не 500", async () => {
    await assert.rejects(
      () => verifyCdekCredentials({ account: "bad", secure: "bad" }),
      (error) => {
        assert.equal(error.statusCode ?? error.status, 400);
        assert.match(error.message, /Account/);
        return true;
      },
    );
  });
});
