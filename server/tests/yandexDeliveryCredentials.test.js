import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

process.env.JWT_SECRET ||= "test-secret-for-yandex-delivery";

const { UserModel } = await import("../models/index.js");
const { sealYandexDeliveryToken, openYandexDeliveryToken } =
  await import("../services/shipping/yandex/yandexDeliveryCredentialsCrypto.js");
const { sealCdekSecret } =
  await import("../services/shipping/cdek/cdekCredentialsCrypto.js");
const {
  readYandexDeliveryConnectionState,
  isYandexDeliveryOfferedBySeller,
  saveSellerYandexDeliveryToken,
  setSellerYandexDeliveryEnabled,
  resolveSellerYandexDeliveryCredentials,
} = await import("../services/shipping/yandex/yandexDeliverySellerCredentials.js");

const realFetch = globalThis.fetch;
const sellerId = "64b000000000000000000001";
const TOKEN = "y2_AgAAAAD04omrAAAPeAAAAAACRpC94Qk6";

/**
 * @param {number} status
 */
function mockYandex(status) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), auth: init.headers?.Authorization });
    return new Response(JSON.stringify({ variants: [] }), { status });
  };
  return calls;
}

afterEach(() => {
  globalThis.fetch = realFetch;
  mock.restoreAll();
});

describe("токен Яндекс Доставки: шифрование", () => {
  it("открывается обратно и не лежит открытым текстом", () => {
    const sealed = sealYandexDeliveryToken(TOKEN);
    assert.ok(!JSON.stringify(sealed).includes("AgAAAAD04"));
    assert.equal(openYandexDeliveryToken(sealed), TOKEN);
  });

  it("чужой формат (секрет СДЭК) за токен Яндекса не принимается", () => {
    assert.throws(() => openYandexDeliveryToken(sealCdekSecret("secret")));
  });
});

describe("состояние подключения Яндекс Доставки", () => {
  it("показывает только хвост токена", () => {
    const state = readYandexDeliveryConnectionState({
      tokenSealed: sealYandexDeliveryToken(TOKEN),
      tokenTail: "C94Q",
    });
    assert.equal(state.connected, true);
    assert.equal(state.enabled, true);
    assert.equal(state.tokenMasked, "••••C94Q");
    assert.ok(!JSON.stringify(state).includes("AgAAAAD04"));
  });

  it("без токена не подключено и покупателям не предлагается", () => {
    assert.equal(readYandexDeliveryConnectionState(null).connected, false);
    assert.equal(isYandexDeliveryOfferedBySeller(null), false);
    assert.equal(
      isYandexDeliveryOfferedBySeller({
        tokenSealed: sealYandexDeliveryToken(TOKEN),
        enabled: false,
      }),
      false,
    );
  });
});

describe("сохранение токена", () => {
  it("Яндекс не принял токен — в базу ничего не пишем", async () => {
    mockYandex(401);
    const update = mock.method(UserModel, "findByIdAndUpdate", () => ({
      lean: async () => null,
    }));

    await assert.rejects(
      saveSellerYandexDeliveryToken({ sellerId, token: TOKEN }),
      /Яндекс не принял токен/,
    );
    assert.equal(update.mock.callCount(), 0);
  });

  it("рабочий токен сохраняется зашифрованным, с хвостом и контуром", async () => {
    const calls = mockYandex(200);
    let saved = null;
    mock.method(UserModel, "findByIdAndUpdate", (id, update) => {
      saved = update.$set;
      return {
        lean: async () => ({
          yandexDeliveryIntegration: {
            tokenSealed: saved["yandexDeliveryIntegration.tokenSealed"],
            tokenTail: saved["yandexDeliveryIntegration.tokenTail"],
            environment: saved["yandexDeliveryIntegration.environment"],
            enabled: true,
          },
        }),
      };
    });

    const state = await saveSellerYandexDeliveryToken({
      sellerId,
      token: ` ${TOKEN} `,
      environment: "test",
    });

    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.startsWith("https://b2b.taxi.tst.yandex.net/"));
    assert.equal(calls[0].auth, `Bearer ${TOKEN}`);
    assert.equal(
      openYandexDeliveryToken(saved["yandexDeliveryIntegration.tokenSealed"]),
      TOKEN,
    );
    assert.equal(state.tokenMasked, "••••4Qk6");
    assert.equal(state.environment, "test");
  });
});

describe("тумблер и чтение токена", () => {
  it("включить без токена нельзя", async () => {
    mock.method(UserModel, "findById", () => ({
      select: () => ({ lean: async () => ({ yandexDeliveryIntegration: null }) }),
    }));
    await assert.rejects(
      setSellerYandexDeliveryEnabled({ sellerId, enabled: true }),
      /Сначала вставьте токен/,
    );
  });

  it("выключенный тумблер закрывает Яндекс для покупателей", async () => {
    mock.method(UserModel, "findById", () => ({
      select: () => ({
        lean: async () => ({
          yandexDeliveryIntegration: {
            tokenSealed: sealYandexDeliveryToken(TOKEN),
            enabled: false,
          },
        }),
      }),
    }));
    await assert.rejects(
      resolveSellerYandexDeliveryCredentials(sellerId, { requireEnabled: true }),
      /не отправляет через Яндекс Доставку/,
    );
    const credentials = await resolveSellerYandexDeliveryCredentials(sellerId);
    assert.equal(credentials.token, TOKEN);
    assert.equal(credentials.environment, "prod");
  });
});
