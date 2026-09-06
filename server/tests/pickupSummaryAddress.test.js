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

  it("две грозненские точки помещаются целиком", () => {
    const line = buildPickupSummaryAddress([GROZNY_1, GROZNY_2]);

    // Склейка даёт 116 символов. Пока поле было на сотню, заказ не создавался
    // вовсе, потом сводка их обрезала — теперь обе точки видны как есть.
    assert.ok(line.length <= ADDRESS_LINE_MAX_LENGTH, `длина ${line.length}`);
    assert.equal(line, `${GROZNY_1}; ${GROZNY_2}`);
  });

  it("точек больше, чем влезает — считаем их числом", () => {
    const line = buildPickupSummaryAddress([GROZNY_1, GROZNY_2, GROZNY_1, GROZNY_2]);

    assert.ok(line.length <= ADDRESS_LINE_MAX_LENGTH, `длина ${line.length}`);
    assert.match(line, /всего точек: 4/u);
  });

  it("короткие адреса по-прежнему показываются списком", () => {
    const line = buildPickupSummaryAddress(["Москва, Тверская 1", "Москва, Арбат 2"]);

    assert.equal(line, "Москва, Тверская 1; Москва, Арбат 2");
  });

  it("не показывает обрывок второго адреса, когда обрезает", () => {
    const line = buildPickupSummaryAddress([GROZNY_1, GROZNY_2, GROZNY_1, GROZNY_2]);

    // Обрывок чужого адреса вводил бы покупателя в заблуждение: в сводке
    // остаётся первая точка целиком и счётчик остальных.
    assert.ok(!line.includes("Мамсурова"), line);
    assert.ok(line.startsWith(GROZNY_1.slice(0, 40)), line);
  });

  it("даже один сверхдлинный адрес не ломает поле", () => {
    const line = buildPickupSummaryAddress(["г ".padEnd(200, "я"), GROZNY_2]);

    assert.ok(line.length <= ADDRESS_LINE_MAX_LENGTH, `длина ${line.length}`);
  });
});
