import assert from "node:assert/strict";
import test from "node:test";

import { mergeLegacyPickupIntoExistingLocations } from "../services/product/productPickupLocations.js";

const multiPointProduct = {
  productPickupAddress: "Москва, Тверская улица, 1",
  productPickupLat: 55.75,
  productPickupLon: 37.62,
  productPickupLocations: [
    {
      id: "p1",
      label: "Основной склад",
      address: "Москва, Тверская улица, 1",
      lat: 55.75,
      lon: 37.62,
      isDefault: true,
    },
    {
      id: "p2",
      label: "Пункт на юге",
      address: "Москва, Варшавское шоссе, 10",
      lat: 55.66,
      lon: 37.61,
      isDefault: false,
    },
    {
      id: "p3",
      label: "Пункт на севере",
      address: "Москва, Дмитровское шоссе, 5",
      lat: 55.86,
      lon: 37.55,
      isDefault: false,
    },
  ],
};

test("legacy-правка адреса меняет только точку по умолчанию", () => {
  const merged = mergeLegacyPickupIntoExistingLocations(multiPointProduct, {
    address: "Москва, Новый Арбат, 3",
    lat: 55.752,
    lon: 37.59,
  });

  assert.equal(merged.length, 3, "остальные точки продавца должны сохраниться");
  assert.deepEqual(
    merged.map((item) => item.id),
    ["p1", "p2", "p3"],
  );
  assert.equal(merged[0].address, "Москва, Новый Арбат, 3");
  assert.equal(merged[0].lat, 55.752);
  assert.equal(merged[0].isDefault, true);
  assert.equal(merged[0].label, "Основной склад", "метка точки не теряется");
  assert.equal(merged[1].address, "Москва, Варшавское шоссе, 10");
  assert.equal(merged[2].address, "Москва, Дмитровское шоссе, 5");
});

test("совпадение с другой точкой схлопывает дубликат, а не плодит его", () => {
  const merged = mergeLegacyPickupIntoExistingLocations(multiPointProduct, {
    address: "москва, варшавское шоссе, 10",
    lat: 55.66,
    lon: 37.61,
  });

  assert.equal(merged.length, 2);
  assert.deepEqual(
    merged.map((item) => item.id),
    ["p1", "p3"],
  );
  assert.equal(merged[0].isDefault, true);
});

test("координаты не затираются, если legacy-клиент их не прислал", () => {
  const merged = mergeLegacyPickupIntoExistingLocations(multiPointProduct, {
    address: "Москва, Новый Арбат, 3",
    lat: null,
    lon: undefined,
  });

  assert.equal(merged[0].lat, 55.75);
  assert.equal(merged[0].lon, 37.62);
});

test("одна точка или пустой адрес — обычный legacy-путь", () => {
  const singlePoint = {
    productPickupAddress: "Москва, Тверская улица, 1",
    productPickupLat: 55.75,
    productPickupLon: 37.62,
  };

  assert.equal(
    mergeLegacyPickupIntoExistingLocations(singlePoint, {
      address: "Москва, Новый Арбат, 3",
      lat: 55.75,
      lon: 37.59,
    }),
    null,
  );
  assert.equal(
    mergeLegacyPickupIntoExistingLocations(multiPointProduct, { address: "  " }),
    null,
  );
});

test("точка без координат не роняет патч в 400, а деградирует в legacy-путь", () => {
  const withBrokenPoint = {
    productPickupLocations: [
      {
        id: "p1",
        address: "Москва, Тверская улица, 1",
        lat: 55.75,
        lon: 37.62,
        isDefault: true,
      },
      { id: "p2", address: "Москва, Варшавское шоссе, 10", lat: null, lon: null },
    ],
  };

  assert.equal(
    mergeLegacyPickupIntoExistingLocations(withBrokenPoint, {
      address: "Москва, Новый Арбат, 3",
      lat: 55.752,
      lon: 37.59,
    }),
    null,
  );
});
