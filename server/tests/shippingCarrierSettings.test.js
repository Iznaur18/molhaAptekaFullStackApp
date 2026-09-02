import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { ShippingCarrierSettingModel } = await import("../models/index.js");
const settings = await import("../services/shipping/shippingCarrierSettings.js");

const ADMIN = "aaaaaaaaaaaaaaaaaaaaaaaa";

describe("админ включает службы доставки", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("без записей действуют дефолты контракта", async () => {
    const rows = await settings.listShippingCarrierSettings();
    const byId = Object.fromEntries(rows.map((row) => [row.carrierId, row]));

    assert.equal(byId.seller.enabled, true);
    assert.equal(byId.gitorg_courier.enabled, true);
    // ЛОБО без ключей: включённой по умолчанию быть не может.
    assert.equal(byId.lobo.configured, false);
    assert.equal(byId.lobo.available, false);
  });

  it("выключенная служба выпадает из доступных", async () => {
    await settings.setShippingCarrierEnabled({
      carrierId: "gitorg_courier",
      enabled: false,
      adminId: ADMIN,
    });

    const available = await settings.listAvailableCarrierIds();
    assert.equal(available.includes("gitorg_courier"), false);
    assert.equal(await settings.isCarrierAvailable("gitorg_courier"), false);
    assert.equal(await settings.isCarrierAvailable("seller"), true);
  });

  it("выключенную можно включить обратно", async () => {
    await settings.setShippingCarrierEnabled({
      carrierId: "gitorg_courier",
      enabled: false,
      adminId: ADMIN,
    });
    await settings.setShippingCarrierEnabled({
      carrierId: "gitorg_courier",
      enabled: true,
      adminId: ADMIN,
    });

    assert.equal(await settings.isCarrierAvailable("gitorg_courier"), true);
  });

  it("ненастроенную службу включить нельзя", async () => {
    // У ЛОБО в тестовом окружении нет ключей: кнопка «включить» соврала бы.
    await assert.rejects(
      () =>
        settings.setShippingCarrierEnabled({
          carrierId: "lobo",
          enabled: true,
          adminId: ADMIN,
        }),
      /не настроена/i,
    );
  });

  it("незнакомая служба отвергается", async () => {
    await assert.rejects(
      () =>
        settings.setShippingCarrierEnabled({
          carrierId: "dpd",
          enabled: true,
          adminId: ADMIN,
        }),
      /Неизвестная служба/i,
    );
  });

  it("решение админа переживает перезапуск: оно в базе", async () => {
    await settings.setShippingCarrierEnabled({
      carrierId: "seller",
      enabled: false,
      adminId: ADMIN,
    });

    const stored = await ShippingCarrierSettingModel.findOne({
      carrierId: "seller",
    }).lean();
    assert.equal(stored.enabled, false);
    assert.equal(String(stored.updatedBy), ADMIN, "видно, с кого спрашивать");
  });

  it("регион остаётся отдельным ограничением", async () => {
    const rows = await settings.listShippingCarrierSettings();
    const lobo = rows.find((row) => row.carrierId === "lobo");

    assert.deepEqual(
      lobo.regions,
      ["RU-CE"],
      "включённость и регион нельзя схлопывать: иначе включённая служба покажется всей стране",
    );
    const seller = rows.find((row) => row.carrierId === "seller");
    assert.equal(seller.regions, null);
  });
});
