import {
  PRODUCT_PICKUP_LOCATIONS_MAX,
  PRODUCT_PICKUP_LOCATION_DEFAULT_REQUIRED_MESSAGE,
} from "@molha/api-contract";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  canAddPickupLocationAddress,
  canUseSavedAddressAsPickupLocation,
  manualPickupLocations,
  normalizePickupLocations,
  pickupLocationFromSavedAddress,
  isPickupAddressAmongLocations,
  pickupLocationsFromSelectedAddresses,
  validateProductPickupLocationsList,
} from "../entities/product/lib/productPickupLocationsFromSavedAddresses.ts";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");
const readMobileFile = (p) => readFileSync(resolve(mobileRoot, p), "utf8");
const readRepoFile = (p) => readFileSync(resolve(repoRoot, p), "utf8");

const addr = (over = {}) => ({
  id: "a",
  label: "Склад",
  line: "г Москва, ул Тверская, д 1",
  flat: "",
  geo: { lat: 55.7, lon: 37.6 },
  ...over,
});

test("адрес без координат в точку не годится", () => {
  assert.equal(canUseSavedAddressAsPickupLocation(addr()), true);
  assert.equal(canUseSavedAddressAsPickupLocation(addr({ geo: null })), false);
  assert.equal(canUseSavedAddressAsPickupLocation(addr({ line: "  " })), false);
  assert.equal(
    canUseSavedAddressAsPickupLocation(addr({ geo: { lat: "x", lon: 37.6 } })),
    false,
  );
});

test("сохранённый адрес разворачивается в точку", () => {
  assert.deepEqual(pickupLocationFromSavedAddress(addr(), true), {
    id: "a",
    label: "Склад",
    address: "г Москва, ул Тверская, д 1",
    lat: 55.7,
    lon: 37.6,
    isDefault: true,
  });
});

test("выбираются только отмеченные и только с координатами", () => {
  const list = [
    addr({ id: "a" }),
    addr({ id: "b", line: "г Москва, ул Арбат, д 5" }),
    addr({ id: "c", line: "г Москва, ул Лесная, д 3", geo: null }),
  ];

  const picked = pickupLocationsFromSelectedAddresses(list, ["a", "c"]);
  assert.deepEqual(
    picked.map((item) => item.id),
    ["a"],
    "адрес без координат отбрасывается",
  );
});

test("ровно одна основная точка", () => {
  const list = [addr({ id: "a" }), addr({ id: "b", line: "г Москва, ул Арбат, д 5" })];

  const first = pickupLocationsFromSelectedAddresses(list, ["a", "b"]);
  assert.deepEqual(
    first.map((item) => item.isDefault),
    [true, false],
    "без прежней основной берётся первая",
  );

  const kept = pickupLocationsFromSelectedAddresses(list, ["a", "b"], "b");
  assert.deepEqual(
    kept.map((item) => item.isDefault),
    [false, true],
    "прежняя основная сохраняется, если ещё выбрана",
  );

  const dropped = pickupLocationsFromSelectedAddresses(list, ["a", "b"], "zzz");
  assert.deepEqual(
    dropped.map((item) => item.isDefault),
    [true, false],
    "если прежняя основная снята — снова первая",
  );
});

test("повтор адреса отбрасывается — его запрещает контракт", () => {
  const list = [addr({ id: "a" }), addr({ id: "b" })];
  const picked = pickupLocationsFromSelectedAddresses(list, ["a", "b"]);
  assert.equal(picked.length, 1);
});

test("лимит точек берётся из контракта", () => {
  const lib = readMobileFile(
    "entities/product/lib/productPickupLocationsFromSavedAddresses.ts",
  );
  assert.match(lib, /PRODUCT_PICKUP_LOCATIONS_MAX/);
  assert.doesNotMatch(lib, /length >= 5\b/, "лимит не должен быть зашит числом");

  const contract = readRepoFile("contract/src/productPickupLocations.js");
  assert.match(contract, /PRODUCT_PICKUP_LOCATIONS_MAX = 5/);
});

test("пикер адресов умеет мультиселект без пункта «другой»", () => {
  const picker = readMobileFile("entities/address/ui/SavedAddressPicker.tsx");
  assert.match(picker, /multiSelect\?: boolean;/);
  assert.match(picker, /accessibilityRole=\{multiSelect \? "checkbox" : "radio"\}/);
  // В мультиселекте «указать другой» скрыт: точки задаются только адресами.
  assert.match(picker, /\{multiSelect \|\| !otherLabel \? null : \(/);
  assert.match(picker, /isOptionDisabled\?\.\(item\.id\) === true/);
});

test("подписи самовывоза заведены", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");
  for (const key of [
    "SAVED_ADDRESSES_LABEL",
    "ADD_LOCATION",
    "PICKUP_MULTI_HINT",
    "LOCATION_NEEDS_COORDS",
  ]) {
    assert.ok(copy.includes(key), `нет ${key}`);
  }
});

const point = (over = {}) => ({
  id: "p1",
  label: "",
  address: "г Москва, ул Арбат, д 5",
  lat: 55.75,
  lon: 37.59,
  isDefault: false,
  ...over,
});

test("ручная точка переживает переключение адреса книги", () => {
  const book = [addr({ id: "a" }), addr({ id: "b", line: "г Москва, ул Ленина, д 2" })];
  const manual = point({ id: "manual-1" });
  const current = [...pickupLocationsFromSelectedAddresses(book, ["a"], null), manual];

  assert.deepEqual(
    manualPickupLocations(current, book).map((item) => item.id),
    ["manual-1"],
  );

  // Продавец ставит галочку на втором адресе книги: ручная точка остаётся.
  const fromBook = pickupLocationsFromSelectedAddresses(book, ["a", "b"], "a");
  const next = normalizePickupLocations(
    [...fromBook, ...manualPickupLocations(current, book)],
    "a",
  );
  assert.deepEqual(next.map((item) => item.id), ["a", "b", "manual-1"]);

  // И снятие галочки со всей книги её тоже не трогает.
  const cleared = normalizePickupLocations(
    [...pickupLocationsFromSelectedAddresses(book, [], "a"), manual],
    "a",
  );
  assert.deepEqual(cleared.map((item) => item.id), ["manual-1"]);
  assert.equal(cleared[0].isDefault, true);
});

test("normalizePickupLocations держит ровно одну основную и лимит", () => {
  const many = Array.from({ length: 9 }, (_, index) =>
    point({ id: `p${index}`, address: `адрес ${index}`, isDefault: true }),
  );
  const next = normalizePickupLocations(many, "p3");
  assert.equal(next.length, PRODUCT_PICKUP_LOCATIONS_MAX);
  assert.deepEqual(next.filter((item) => item.isDefault).map((item) => item.id), ["p3"]);

  // Прежней основной в наборе нет — основной становится первая.
  assert.equal(normalizePickupLocations(many, "нет-такой")[0].isDefault, true);
  assert.deepEqual(normalizePickupLocations([], "p1"), []);
});

test("дубль адреса и адрес без координат добавить нельзя", () => {
  const current = [point()];
  assert.equal(
    canAddPickupLocationAddress(current, "г Москва, ул Тверская, д 9", 55.7, 37.6),
    true,
  );
  // Тот же адрес другим регистром/пробелами — контрактный ключ дублей тот же.
  assert.equal(
    canAddPickupLocationAddress(current, "  Г МОСКВА, УЛ АРБАТ, Д 5 ", 55.75, 37.59),
    false,
  );
  assert.equal(canAddPickupLocationAddress(current, "г Тула, ул Мира, д 3", null, 37.6), false);
  assert.equal(canAddPickupLocationAddress(current, "   ", 55.7, 37.6), false);

  const full = Array.from({ length: PRODUCT_PICKUP_LOCATIONS_MAX }, (_, index) =>
    point({ id: `p${index}`, address: `адрес ${index}` }),
  );
  assert.equal(canAddPickupLocationAddress(full, "новый адрес", 55.7, 37.6), false);
});

test("шаг мастера рисует кнопку добавления и удаление точки", () => {
  const source = readMobileFile("entities/product/ui/ProductPickupLocationFields.tsx");
  assert.ok(source.includes("PRODUCT_PICKUP_UI.ADD_LOCATION"), "нет кнопки добавления");
  assert.ok(source.includes("onPress={addTypedAddressAsPoint}"), "кнопка не подключена");
  assert.ok(source.includes("disabled={!canAddTypedAddress}"), "кнопка не блокируется");
  assert.ok(source.includes("removePickupPoint(point.id)"), "нет удаления ручной точки");
  assert.ok(
    source.includes("PRODUCT_PICKUP_UI.LOCATIONS_MAX(PRODUCT_PICKUP_LOCATIONS_MAX)"),
    "нет подсказки про лимит",
  );

  const copy = readMobileFile("shared/config/appUiCopy.ts");
  assert.ok(copy.includes("REMOVE_LOCATION"), "нет копирайта REMOVE_LOCATION");
});

test("validateProductPickupLocationsList повторяет правила контракта", () => {
  // Пустой список не ошибка: обязательное легаси-поле адреса сервер сам
  // заворачивает в единственную точку.
  assert.equal(validateProductPickupLocationsList([]), null);

  const ok = [point({ id: "p1", isDefault: true }), point({ id: "p2", address: "г Тула, ул Мира, д 3" })];
  assert.equal(validateProductPickupLocationsList(ok), null);

  assert.equal(
    validateProductPickupLocationsList([point({ isDefault: false })]),
    PRODUCT_PICKUP_LOCATION_DEFAULT_REQUIRED_MESSAGE,
  );
  assert.equal(
    validateProductPickupLocationsList([
      point({ id: "p1", isDefault: true }),
      point({ id: "p2", address: "г Тула, ул Мира, д 3", isDefault: true }),
    ]),
    PRODUCT_PICKUP_LOCATION_DEFAULT_REQUIRED_MESSAGE,
  );

  const tooMany = Array.from({ length: PRODUCT_PICKUP_LOCATIONS_MAX + 1 }, (_, index) =>
    point({ id: `p${index}`, address: `г Тула, ул Мира, д ${index}`, isDefault: index === 0 }),
  );
  assert.match(validateProductPickupLocationsList(tooMany), /Не больше/);

  assert.ok(
    validateProductPickupLocationsList([point({ isDefault: true, address: "дом" })]),
    "короткий адрес обязан отвергаться",
  );
  assert.ok(
    validateProductPickupLocationsList([point({ isDefault: true, lat: null })]),
    "точка без координат обязана отвергаться",
  );
  assert.match(
    validateProductPickupLocationsList([
      point({ id: "p1", isDefault: true }),
      point({ id: "p2", address: "  Г МОСКВА, УЛ АРБАТ, Д 5  " }),
    ]),
    /уже добавлен/,
  );
  assert.match(
    validateProductPickupLocationsList([point({ isDefault: true, label: "я".repeat(31) })]),
    /Метка не длиннее/,
  );
});

test("набранный адрес виден среди точек без оглядки на регистр", () => {
  const points = [point({ isDefault: true })];
  assert.equal(isPickupAddressAmongLocations("г Москва, ул Арбат, д 5", points), true);
  assert.equal(isPickupAddressAmongLocations("  Г МОСКВА, УЛ АРБАТ, Д 5 ", points), true);
  assert.equal(isPickupAddressAmongLocations("г Тула, ул Мира, д 3", points), false);
  assert.equal(isPickupAddressAmongLocations("   ", points), false);
});

test("шаг мастера проверяет список и не теряет набранный адрес", () => {
  const source = readMobileFile("features/create-product/ui/CreateProductScreen.tsx");
  assert.ok(
    source.includes("validateProductPickupLocationsList(points)"),
    "шаг не проверяет список точек",
  );
  assert.ok(
    source.includes("PRODUCT_PICKUP_UI.ERROR_ADDRESS_NOT_ADDED"),
    "шаг молча теряет набранный адрес",
  );
  // Легаси-поля обязаны собираться из основной точки, иначе сервер сохранит
  // адрес, которого продавец в списке не видел.
  assert.ok(
    source.includes("syncLegacyPickupFieldsFromLocations(form.productPickupLocations)"),
    "легаси-поля не синхронизируются со списком",
  );
  assert.equal(
    (source.match(/legacyPickup\.productPickupAddress/g) ?? []).length,
    2,
    "адрес должен браться из legacyPickup в обеих отправках",
  );
  // Пустой список в патче отправлять нельзя: сервер схлопнул бы мультиточки.
  assert.equal(
    (source.match(/form\.productPickupLocations\.length > 0/g) ?? []).length,
    3,
    "нет guard'ов на пустой список",
  );
});
