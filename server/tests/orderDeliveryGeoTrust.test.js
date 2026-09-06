import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { resolveOrderDeliveryGeo } = await import(
  "../services/order/resolveOrderDeliveryGeo.js"
);
const { buildAddressQueryForClean, buildAddressQueryForSuggest } = await import(
  "../utils/dadata/verifyRuDeliveryAddress.js"
);

/** Грозный: склад продавца и настоящий адрес покупателя километрах в 11. */
const VERIFIED = { lat: 43.4, lon: 45.7 };
/** Точка, которую покупатель «нашёл» вплотную к складу, чтобы не платить за км. */
const SPOOFED = { lat: 43.3, lon: 45.7 };

describe("кому верим в координатах доставки", () => {
  it("километраж считается по проверенным, а не по присланным", () => {
    const { tariffGeo } = resolveOrderDeliveryGeo({
      verifiedGeo: VERIFIED,
      clientGeo: SPOOFED,
    });

    assert.deepEqual(
      tariffGeo,
      VERIFIED,
      "иначе покупатель обнуляет километраж, подправив тело запроса",
    );
  });

  it("без проверенных координат километраж не начисляется вовсе", () => {
    const { tariffGeo } = resolveOrderDeliveryGeo({
      verifiedGeo: null,
      clientGeo: SPOOFED,
    });

    assert.equal(
      tariffGeo,
      null,
      "счёт по числу, которое назвал плательщик, — не счёт",
    );
  });

  it("везём по клиентским: точка с карты точнее уличных координат", () => {
    const { storedGeo } = resolveOrderDeliveryGeo({
      verifiedGeo: VERIFIED,
      clientGeo: SPOOFED,
    });

    assert.deepEqual(
      storedGeo,
      SPOOFED,
      "у домов без ФИАС проверенные приходят уровнем улицы, а не подъезда",
    );
  });

  it("в заказ кладём проверенные, когда клиент ничего не прислал", () => {
    const { storedGeo } = resolveOrderDeliveryGeo({
      verifiedGeo: VERIFIED,
      clientGeo: null,
    });

    assert.deepEqual(
      storedGeo,
      VERIFIED,
      "пустое поле означало бы, что заказ некому везти",
    );
  });

  it("половина координат — это не координаты", () => {
    const { storedGeo, tariffGeo } = resolveOrderDeliveryGeo({
      verifiedGeo: { lat: 43.4, lon: null },
      clientGeo: { lat: null, lon: 45.7 },
    });

    assert.equal(storedGeo, null);
    assert.equal(tariffGeo, null);
  });

  it("нулевые координаты остаются координатами", () => {
    // Number(null) === 0: без явной проверки на пустое значение точка без
    // координат читалась бы как валидный ноль в Гвинейском заливе.
    const { tariffGeo } = resolveOrderDeliveryGeo({
      verifiedGeo: { lat: 0, lon: 0 },
      clientGeo: null,
    });

    assert.deepEqual(tariffGeo, { lat: 0, lon: 0 });
  });

  it("нет ничего — нет ничего", () => {
    assert.deepEqual(resolveOrderDeliveryGeo(), { storedGeo: null, tariffGeo: null });
  });
});

describe("запрос адреса в DaData", () => {
  it("подсказки спрашиваем без квартиры", () => {
    // suggest на строку с «кв 1» возвращает ноль вариантов — проверено на
    // боевых ключах. Пока запрос был общий с clean, фолбэк не срабатывал ни
    // разу, и адрес доставки оставался без координат и без ФИАС.
    assert.equal(
      buildAddressQueryForSuggest("г Москва, ул Тверская, д 7"),
      "г Москва, ул Тверская, д 7",
    );
  });

  it("стандартизации квартиру по-прежнему передаём: она её разбирает", () => {
    assert.equal(
      buildAddressQueryForClean("г Москва, ул Тверская, д 7", "1"),
      "г Москва, ул Тверская, д 7, кв 1",
    );
  });
});
