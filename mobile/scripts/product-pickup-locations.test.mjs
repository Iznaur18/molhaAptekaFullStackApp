import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  canUseSavedAddressAsPickupLocation,
  pickupLocationFromSavedAddress,
  pickupLocationsFromSelectedAddresses,
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
