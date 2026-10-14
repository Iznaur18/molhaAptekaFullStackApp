import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isCardPrepaidAvailableForSellers,
  isOrderAwaitingPrepayment,
  resolveCartAllowedPaymentMethods,
  resolveCheckoutPaymentMethodOptions,
  resolveNextShipmentStatus,
  resolveShipmentAdvanceAction,
} from "../dist/index.js";

describe("resolveCartAllowedPaymentMethods", () => {
  it("без продавцов доступны все способы", () => {
    assert.deepEqual(resolveCartAllowedPaymentMethods([]), [
      "cashOnDelivery",
      "cardPrepaid",
      "cardOnDelivery",
    ]);
  });

  it("пустой список у продавца значит «не настраивал» — принимает всё", () => {
    assert.deepEqual(resolveCartAllowedPaymentMethods([{ sellerPaymentMethods: [] }]), [
      "cashOnDelivery",
      "cardPrepaid",
      "cardOnDelivery",
    ]);
  });

  it("несколько продавцов — пересечение, а не объединение", () => {
    assert.deepEqual(
      resolveCartAllowedPaymentMethods([
        { sellerPaymentMethods: ["cashOnDelivery", "cardOnDelivery"] },
        { sellerPaymentMethods: ["cardOnDelivery"] },
      ]),
      ["cardOnDelivery"],
    );
  });
});

describe("isCardPrepaidAvailableForSellers", () => {
  it("доступна, только если все продавцы в списке площадки", () => {
    assert.equal(isCardPrepaidAvailableForSellers(["a", "b"], ["a"]), true);
    assert.equal(isCardPrepaidAvailableForSellers(["a"], ["a", "c"]), false);
  });

  it("нет списка или нет продавцов — недоступна", () => {
    assert.equal(isCardPrepaidAvailableForSellers([], ["a"]), false);
    assert.equal(isCardPrepaidAvailableForSellers(undefined, ["a"]), false);
    assert.equal(isCardPrepaidAvailableForSellers(["a"], []), false);
  });
});

describe("resolveCheckoutPaymentMethodOptions", () => {
  it("по умолчанию СБП заблокирована как «скоро», а не «продавец не принимает»", () => {
    const options = resolveCheckoutPaymentMethodOptions();
    assert.deepEqual(options.availableMethods, ["cashOnDelivery", "cardOnDelivery"]);
    assert.deepEqual(options.orderedMethods, [
      "cashOnDelivery",
      "cardOnDelivery",
      "cardPrepaid",
    ]);
    assert.deepEqual(options.notAcceptedBySeller, []);
  });

  it("продавец сужает способы, но не открывает предоплату своей галочкой", () => {
    const options = resolveCheckoutPaymentMethodOptions({
      allowedMethods: ["cardPrepaid", "cardOnDelivery"],
    });
    assert.deepEqual(options.availableMethods, ["cardOnDelivery"]);
    assert.deepEqual(options.notAcceptedBySeller, ["cashOnDelivery"]);
  });

  it("предоплата открывается площадкой и тоже сужается продавцом", () => {
    assert.deepEqual(
      resolveCheckoutPaymentMethodOptions({ cardPrepaidAvailable: true })
        .availableMethods,
      ["cashOnDelivery", "cardPrepaid", "cardOnDelivery"],
    );
    assert.deepEqual(
      resolveCheckoutPaymentMethodOptions({
        cardPrepaidAvailable: true,
        allowedMethods: ["cashOnDelivery"],
      }).notAcceptedBySeller,
      ["cardPrepaid", "cardOnDelivery"],
    );
  });

  it("скрытые способы не показываются вовсе", () => {
    const options = resolveCheckoutPaymentMethodOptions({
      hiddenMethods: ["cashOnDelivery"],
    });
    assert.deepEqual(options.orderedMethods, ["cardOnDelivery", "cardPrepaid"]);
    assert.deepEqual(options.availableMethods, ["cardOnDelivery"]);
  });
});

describe("isOrderAwaitingPrepayment", () => {
  it("ждёт денег только заказ с предоплатой без отметки об оплате", () => {
    assert.equal(isOrderAwaitingPrepayment({ paymentMethod: "cardPrepaid" }), true);
    assert.equal(
      isOrderAwaitingPrepayment({
        paymentMethod: "cardPrepaid",
        prepaidPaidAt: "2026-10-12T10:00:00.000Z",
      }),
      false,
    );
    assert.equal(isOrderAwaitingPrepayment({ paymentMethod: "cashOnDelivery" }), false);
    assert.equal(isOrderAwaitingPrepayment(null), false);
  });
});

describe("ступени отправления", () => {
  it("лестница расходится на самовывоз и доставку после сборки", () => {
    assert.equal(resolveNextShipmentStatus("pending", "pickup"), "accepted");
    assert.equal(resolveNextShipmentStatus("accepted", "pickup"), "assembling");
    assert.equal(resolveNextShipmentStatus("assembling", "pickup"), "ready_for_pickup");
    assert.equal(resolveNextShipmentStatus("assembling", "delivery"), "ready_to_ship");
    assert.equal(resolveNextShipmentStatus("ready_for_pickup", "pickup"), null);
    assert.equal(resolveNextShipmentStatus("shipped", "delivery"), null);
  });

  it("у каждой ступени есть подпись кнопки", () => {
    assert.deepEqual(resolveShipmentAdvanceAction("pending", "pickup"), {
      nextStatus: "accepted",
      label: "Принять",
    });
    assert.deepEqual(resolveShipmentAdvanceAction("assembling", "delivery"), {
      nextStatus: "ready_to_ship",
      label: "Готов к отгрузке",
    });
    assert.equal(resolveShipmentAdvanceAction("delivered", "pickup"), null);
  });
});
