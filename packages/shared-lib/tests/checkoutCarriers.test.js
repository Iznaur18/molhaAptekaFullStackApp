import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCdekOrderSelection,
  formatCarrierPeriodDays,
  resolveCheckoutChosenCarrier,
} from "../dist/index.js";

describe("resolveCheckoutChosenCarrier", () => {
  const base = {
    needsDelivery: true,
    carrierOptions: ["cdek"],
    carrierChoice: null,
    sellerDeliveryAvailable: true,
  };

  it("по умолчанию — своя доставка продавца", () => {
    assert.equal(resolveCheckoutChosenCarrier(base), null);
  });

  it("выбор покупателя уважается, пока служба доступна", () => {
    assert.equal(
      resolveCheckoutChosenCarrier({ ...base, carrierChoice: "cdek" }),
      "cdek",
    );
    assert.equal(
      resolveCheckoutChosenCarrier({
        ...base,
        carrierChoice: "cdek",
        carrierOptions: [],
      }),
      null,
    );
  });

  it("если продавец сам не везёт, первая служба выбрана без нажатия", () => {
    assert.equal(
      resolveCheckoutChosenCarrier({ ...base, sellerDeliveryAvailable: false }),
      "cdek",
    );
  });

  it("при самовывозе службы нет", () => {
    assert.equal(
      resolveCheckoutChosenCarrier({
        ...base,
        needsDelivery: false,
        carrierChoice: "cdek",
      }),
      null,
    );
    assert.equal(
      resolveCheckoutChosenCarrier({
        ...base,
        needsPickup: true,
        carrierChoice: "cdek",
      }),
      null,
    );
  });
});

describe("buildCdekOrderSelection", () => {
  const full = {
    pointCode: "MSK123",
    tariffCode: 136,
    cityCode: 44,
    recipientName: " Иван Петров ",
    recipientPhone: " +79001234567 ",
  };

  it("полный выбор уходит в заказ без цены", () => {
    assert.deepEqual(buildCdekOrderSelection(full), {
      tariffCode: 136,
      pickupPointCode: "MSK123",
      toCityCode: 44,
      recipient: { name: "Иван Петров", phone: "+79001234567" },
    });
  });

  it("без пункта, тарифа, города, имени или телефона выбора нет", () => {
    for (const patch of [
      { pointCode: "" },
      { tariffCode: null },
      { cityCode: null },
      { recipientName: "И" },
      // Без телефона СДЭК отправление не примет.
      { recipientPhone: "12345" },
    ]) {
      assert.equal(
        buildCdekOrderSelection({ ...full, ...patch }),
        null,
        JSON.stringify(patch),
      );
    }
  });
});

describe("formatCarrierPeriodDays", () => {
  it("один срок, диапазон и отсутствие срока", () => {
    assert.equal(formatCarrierPeriodDays(3, 3), "3 дн.");
    assert.equal(formatCarrierPeriodDays(3, 5), "3–5 дн.");
    assert.equal(formatCarrierPeriodDays(null, 5), "5 дн.");
    assert.equal(formatCarrierPeriodDays(null, null), "");
  });
});
