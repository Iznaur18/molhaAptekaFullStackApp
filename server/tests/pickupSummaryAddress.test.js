import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ADDRESS_LINE_MAX_LENGTH } from "../constants/dadataConstants.js";
import { buildPickupSummaryAddress } from "../services/order/createOrder.js";

// Боевые адреса: на них 27.08.2026 шесть раз падало создание заказа.
const GROZNY_1 = "г Грозный, р-н Ахматовский, ул Хамида Ахмадовича Ахмадова, уч 27а";
const GROZNY_2 = "г Грозный, р-н Байсангуровский, ул Мамсурова, д 12";

describe("сводка адресов самовывоза", () => {
  it("одна точка — адрес как есть", () => {
    assert.equal(buildPickupSummaryAddress([GROZNY_1]), GROZNY_1);
  });

  it("две грозненские точки влезают в поле заказа", () => {
    const line = buildPickupSummaryAddress([GROZNY_1, GROZNY_2]);

    // Раньше склейка давала 116 символов, и заказ не создавался вовсе.
    assert.ok(line.length <= ADDRESS_LINE_MAX_LENGTH, `длина ${line.length}`);
    assert.match(line, /всего точек: 2/u);
  });

  it("короткие адреса по-прежнему показываются списком", () => {
    const line = buildPickupSummaryAddress(["Москва, Тверская 1", "Москва, Арбат 2"]);

    assert.equal(line, "Москва, Тверская 1; Москва, Арбат 2");
  });

  it("не показывает обрывок второго адреса", () => {
    const line = buildPickupSummaryAddress([GROZNY_1, GROZNY_2]);

    // Обрывок чужого адреса вводил бы покупателя в заблуждение.
    assert.ok(!line.includes("Мамсурова"), line);
  });

  it("даже один сверхдлинный адрес не ломает поле", () => {
    const line = buildPickupSummaryAddress(["г ".padEnd(200, "я"), GROZNY_2]);

    assert.ok(line.length <= ADDRESS_LINE_MAX_LENGTH, `длина ${line.length}`);
  });
});
