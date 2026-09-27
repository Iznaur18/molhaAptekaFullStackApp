import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CDEK_STAGE_READY_FOR_PICKUP,
  formatCdekKeepFreeUntil,
  formatCdekStageLabel,
  isCdekAwaitingPickup,
  isShipmentStatusManagedByCarrier,
  resolveCdekStage,
} from "../src/index.js";

describe("этап посылки СДЭК как на cdek.ru", () => {
  it("«Принят на склад до востребования» — это «Готов к выдаче»", () => {
    assert.equal(
      resolveCdekStage("ACCEPTED_AT_PICK_UP_POINT"),
      CDEK_STAGE_READY_FOR_PICKUP,
    );
    assert.equal(formatCdekStageLabel("ACCEPTED_AT_PICK_UP_POINT"), "Готов к выдаче");
    assert.equal(formatCdekStageLabel("POSTOMAT_POSTED"), "Готов к выдаче");
  });

  it("склады и перевозчики — «В пути»", () => {
    for (const code of [
      "ACCEPTED_AT_TRANSIT_WAREHOUSE",
      "SENT_TO_RECIPIENT_CITY",
      "RECEIVED_AT_SHIPMENT_WAREHOUSE",
      "НЕИЗВЕСТНЫЙ_НОВЫЙ_КОД",
    ]) {
      assert.equal(formatCdekStageLabel(code), "В пути", code);
    }
  });

  it("начало и конец пути", () => {
    assert.equal(formatCdekStageLabel("CREATED"), "Создан");
    assert.equal(formatCdekStageLabel("ACCEPTED"), "Создан");
    assert.equal(formatCdekStageLabel("DELIVERED"), "Вручён");
    assert.equal(formatCdekStageLabel("NOT_DELIVERED"), "Не вручён");
    assert.equal(
      formatCdekStageLabel("RETURNED_TO_TRANSIT_WAREHOUSE"),
      "Возврат отправителю",
    );
    assert.equal(formatCdekStageLabel("REMOVED"), "Отменён");
  });

  it("без кода — запасная подпись", () => {
    assert.equal(resolveCdekStage(""), null);
    assert.equal(formatCdekStageLabel(null, "Принят"), "Принят");
  });

  it("срок хранения — день по Москве, как пишет СДЭК", () => {
    assert.equal(formatCdekKeepFreeUntil("2026-10-03T20:59:59Z"), "3 октября");
    assert.equal(formatCdekKeepFreeUntil(new Date("2026-12-31T21:30:00Z")), "1 января");
    assert.equal(formatCdekKeepFreeUntil(""), "");
    assert.equal(formatCdekKeepFreeUntil("мусор"), "");
  });

  it("срок хранения нужен только пока посылка ждёт в пункте", () => {
    assert.equal(isCdekAwaitingPickup("ACCEPTED_AT_PICK_UP_POINT"), true);
    assert.equal(isCdekAwaitingPickup("DELIVERED"), false);
    assert.equal(isCdekAwaitingPickup("SENT_TO_RECIPIENT_CITY"), false);
  });
});

describe("статус отправления ведёт служба", () => {
  it("СДЭК и Яндекс — да, ЛОБО и свой курьер — нет", () => {
    assert.equal(isShipmentStatusManagedByCarrier("cdek"), true);
    assert.equal(isShipmentStatusManagedByCarrier("yandex_delivery"), true);
    assert.equal(isShipmentStatusManagedByCarrier("yandex_express"), true);
    assert.equal(isShipmentStatusManagedByCarrier("lobo"), false);
    assert.equal(isShipmentStatusManagedByCarrier("seller"), false);
    assert.equal(isShipmentStatusManagedByCarrier(""), false);
    assert.equal(isShipmentStatusManagedByCarrier(null), false);
  });
});
