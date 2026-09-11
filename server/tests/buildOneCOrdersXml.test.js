import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildOneCOrderDocumentId,
  buildOrderDocument,
  escapeXml,
} from "../services/onec/exchange/buildOneCOrdersXml.js";

describe("buildOneCOrdersXml Bitrix shape", () => {
  it("escapeXml strips control chars and escapes markup", () => {
    assert.equal(escapeXml("a<b>&c"), "a&lt;b&gt;&amp;c");
    assert.equal(escapeXml("ok\u0001bad"), "okbad");
  });

  it("document id is plain order id without seller suffix", () => {
    assert.equal(buildOneCOrderDocumentId("6aa0160770c1f477e255b2b3"), "6aa0160770c1f477e255b2b3");
  });

  it("buildOrderDocument matches Bitrix-facing CommerceML cues", () => {
    const xml = buildOrderDocument({
      order: {
        _id: "6aa0160770c1f477e255b2b3",
        userBuyerId: "6a8200da92fa5bb5a9db1e53",
        createdAt: new Date("2026-09-08T14:04:55.000Z"),
        fulfillmentMethod: "delivery",
        paymentMethod: "cardOnDelivery",
        status: "cancelled",
        deliveryAddress: "г Грозный, ул Тест, д 1",
      },
      buyer: {
        userName: "iznaurguzhaev",
        userPhoneNumber: "+79297177703",
        email: "gimer8@mail.ru",
      },
      lines: [
        {
          guid: "f0d9b196-5e8d-11f1-856c-ac799ffae03a",
          name: "Авто тряпка",
          quantity: 1,
          price: 265,
        },
      ],
    });

    assert.match(xml, /<Ид>6aa0160770c1f477e255b2b3<\/Ид>/);
    assert.doesNotMatch(xml, /<Ид>[^<]*:[^<]*<\/Ид>/);
    assert.match(xml, /<Тип>Телефон рабочий<\/Тип>/);
    assert.match(xml, /<Тип>Электронная почта<\/Тип>/);
    assert.match(xml, /<Значение>Картой при получении<\/Значение>/);
    assert.match(xml, /<Наименование>Отменен<\/Наименование>\s*<Значение>true<\/Значение>/);
    assert.match(xml, /<Единица>/);
    assert.match(xml, /<Коэффициент>1<\/Коэффициент>/);
    assert.match(xml, /<Цена>265\.00<\/Цена>/);
    assert.match(xml, /<Курс>1\.0000<\/Курс>/);
    assert.match(xml, /<Наименование>ВидНоменклатуры<\/Наименование>/);
  });
});
