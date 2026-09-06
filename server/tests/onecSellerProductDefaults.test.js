import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { UserModel } = await import("../models/index.js");
const { resolveSellerProductDefaults } = await import(
  "../services/onec/exchange/processOneCImportJob.js"
);

/** Боевой адрес продавца, на котором это и вскрылось. */
const ADDRESS = "г Грозный, р-н Ахматовский, ул Субры Кишиевой, д 56";
const GEO = { lat: 43.324728, lon: 45.711483 };

/** @param {Record<string, unknown>} [overrides] */
const createSeller = (overrides = {}) =>
  UserModel.create({
    email: `onec-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "x".repeat(20),
    userName: `onec${Math.random().toString(36).slice(2, 9)}`,
    ...overrides,
  });

const PROFILE = {
  pickupLocations: [
    {
      id: "037bb089-9632-4c53-ba80-cac4c587c500",
      label: "Супермаркет",
      address: ADDRESS,
      ...GEO,
      isDefault: true,
    },
  ],
  pickupEnabled: true,
  deliveryCarrier: "seller",
  regionCode: "RU-CE",
};

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

describe("настройки продавца для карточек из 1С", () => {
  it("берёт адрес из «Доставки и оплаты»", async () => {
    // Ровно тот случай, на котором вскрылось: раздел заполнен, а старое
    // одиночное поле координат пусто. Резолвер читал только его и отдавал
    // карточки без адреса и с выключенным самовывозом.
    const seller = await createSeller({
      userAddress: ADDRESS,
      userAddressGeo: null,
      sellerFulfillmentDefaults: PROFILE,
    });

    const { defaults, warning } = await resolveSellerProductDefaults(
      String(seller._id),
    );

    assert.equal(warning, "");
    assert.equal(defaults.productPickupAddress, ADDRESS);
    assert.equal(defaults.productPickupLat, GEO.lat);
    assert.equal(defaults.productPickupLon, GEO.lon);
    assert.equal(defaults.productRegionCode, "RU-CE");
    assert.equal(defaults.productPickupEnabled, true);
    assert.equal(defaults.productDeliveryCarrier, "seller");
  });

  it("ставит карточку на профиль: CommerceML своего адреса не содержит", async () => {
    const seller = await createSeller({ sellerFulfillmentDefaults: PROFILE });

    const { defaults } = await resolveSellerProductDefaults(String(seller._id));

    assert.equal(
      defaults.productFulfillmentSource,
      "profile",
      "иначе правка раздела не разойдётся по выгруженным карточкам",
    );
  });

  it("без раздела уходит на старый путь, а не подчиняет карточку профилю", async () => {
    // Довести старый путь до адреса в тестах нельзя: регион он определяет
    // через DaData, а ключей здесь нет. Важно другое — что ветка выбрана не
    // профильная: подчинять профилю карточку, у которой адрес свой, нельзя.
    const seller = await createSeller({
      userAddress: ADDRESS,
      userAddressGeo: GEO,
    });

    const { defaults } = await resolveSellerProductDefaults(String(seller._id));

    assert.equal(defaults.productFulfillmentSource, undefined);
  });

  it("нечего взять — карточки вне витрины и предупреждение в журнал", async () => {
    const seller = await createSeller({ userAddress: "", userAddressGeo: null });

    const { defaults, warning } = await resolveSellerProductDefaults(
      String(seller._id),
    );

    assert.equal(defaults.productPickupEnabled, false);
    assert.ok(warning, "продавец должен увидеть причину в журнале обмена");
  });
});
