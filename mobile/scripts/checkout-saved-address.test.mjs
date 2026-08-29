import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Модуль без alias-импортов значений (только type-import) — Node стрипает типы
// и гоняет настоящую логику.
import {
  CHECKOUT_SAVED_ADDRESS_CUSTOM_ID,
  deliveryAddressFromSaved,
  matchCheckoutSavedAddressId,
  resolveInitialCheckoutSavedAddressId,
} from "../entities/address/lib/deliveryAddressFromSaved.ts";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");

const readMobileFile = (relativePath) =>
  readFileSync(resolve(mobileRoot, relativePath), "utf8");
const readRepoFile = (relativePath) =>
  readFileSync(resolve(repoRoot, relativePath), "utf8");

const HOME = {
  id: "home",
  label: "Дом",
  line: "г Москва, ул Тверская, д 1",
  flat: "12",
  fiasId: "fias-1",
  geo: { lat: 55.7, lon: 37.6 },
  isDefault: false,
};
const WORK = {
  id: "work",
  label: "Работа",
  line: "г Москва, ул Арбат, д 5",
  flat: "",
  fiasId: "fias-2",
  geo: null,
  isDefault: true,
};

test("без адресов выбран пункт «другой»", () => {
  assert.equal(resolveInitialCheckoutSavedAddressId([]), CHECKOUT_SAVED_ADDRESS_CUSTOM_ID);
  assert.equal(
    resolveInitialCheckoutSavedAddressId(undefined),
    CHECKOUT_SAVED_ADDRESS_CUSTOM_ID,
  );
});

test("по умолчанию выбирается адрес с isDefault, иначе первый", () => {
  assert.equal(resolveInitialCheckoutSavedAddressId([HOME, WORK]), "work");
  assert.equal(
    resolveInitialCheckoutSavedAddressId([HOME, { ...WORK, isDefault: false }]),
    "home",
  );
});

test("сохранённый адрес разворачивается в значение поля доставки", () => {
  assert.deepEqual(deliveryAddressFromSaved(HOME), {
    line: "г Москва, ул Тверская, д 1",
    flat: "12",
    fiasId: "fias-1",
    geo: { lat: 55.7, lon: 37.6 },
    regionCode: null,
    selectedFromSuggest: true,
  });
});

test("пустой адрес не считается выбранным из подсказок", () => {
  const value = deliveryAddressFromSaved({ id: "x", line: "  " });
  assert.equal(value.selectedFromSuggest, false);
  assert.equal(value.geo, null);
});

test("ручная правка переводит подсветку на совпавший адрес или на «другой»", () => {
  const addresses = [HOME, WORK];

  assert.equal(
    matchCheckoutSavedAddressId({ line: HOME.line, flat: "12" }, addresses),
    "home",
  );
  // Квартира — часть совпадения: тот же дом, другая квартира → «другой».
  assert.equal(
    matchCheckoutSavedAddressId({ line: HOME.line, flat: "13" }, addresses),
    CHECKOUT_SAVED_ADDRESS_CUSTOM_ID,
  );
  assert.equal(
    matchCheckoutSavedAddressId({ line: WORK.line, flat: "" }, addresses),
    "work",
  );
  assert.equal(
    matchCheckoutSavedAddressId({ line: "", flat: "" }, addresses),
    CHECKOUT_SAVED_ADDRESS_CUSTOM_ID,
  );
});

test("логика повторяет веб один в один", () => {
  const web = readRepoFile("client/src/entities/address/lib/deliveryAddressFromSaved.js");
  assert.match(web, /CHECKOUT_SAVED_ADDRESS_CUSTOM_ID = "__custom__"/);
  assert.equal(CHECKOUT_SAVED_ADDRESS_CUSTOM_ID, "__custom__");
  assert.match(web, /addresses\.find\(\(item\) => item\.isDefault\) \?\? addresses\[0\]/);
});

test("подписи чекаута совпадают с вебом", () => {
  const web = readRepoFile("client/src/shared/config/copy/cart-checkout.js");
  const mobile = readMobileFile("shared/config/appUiCopy.ts");

  for (const line of [
    'LABEL_SAVED_ADDRESSES: "Сохранённые адреса"',
    'SAVED_ADDRESS_OTHER: "Указать другой на карте"',
    'LABEL_DEFAULT: "По умолчанию"',
  ]) {
    assert.ok(web.includes(line), `нет в вебе: ${line}`);
    assert.ok(mobile.includes(line), `нет в мобилке: ${line}`);
  }
});

test("поля чекаута совпадают с web checkout-form__input", () => {
  const styles = readMobileFile("shared/theme/formChromeStyles.ts");
  const layout = readMobileFile("features/checkout/lib/checkoutFormInputLayout.ts");
  const webCss = readRepoFile("client/src/shared/ui/CheckoutForm/CheckoutForm.css");

  assert.match(webCss, /background: var\(--iz-color-surface-muted\)/);
  assert.match(webCss, /color: var\(--iz-color-text\)/);
  assert.match(layout, /paddingVertical: 9/);
  assert.match(layout, /fontSize: 15/);
  assert.match(styles, /CHECKOUT_FORM_INPUT_LAYOUT/);
  assert.match(styles, /fieldInput:[\s\S]*backgroundColor: theme\.colors\.surfaceMuted/);
  assert.match(styles, /fieldInput:[\s\S]*color: theme\.colors\.text/);
});

test("форма чекаута показывает список и слушает ручную правку", () => {
  const form = readMobileFile("features/checkout/ui/CheckoutForm.tsx");
  assert.match(form, /<CheckoutSavedAddressPicker/);
  assert.match(form, /onSelect=\{handleSavedAddressSelect\}/);
  // Поле адреса теперь ходит через обёртку, а не напрямую в setState.
  assert.match(form, /onChange=\{handleDeliveryAddressChange\}/);
  assert.doesNotMatch(form, /onChange=\{setDeliveryAddress\}/);
  // Список берётся из книги адресов профиля.
  assert.match(form, /userSavedAddressesFromUser\(defaultUser\)/);
});

test("пункт «другой» очищает поле, а не оставляет прошлый адрес", () => {
  const form = readMobileFile("features/checkout/ui/CheckoutForm.tsx");
  assert.match(
    form,
    /nextId === CHECKOUT_SAVED_ADDRESS_CUSTOM_ID\)\s*\{[\s\S]{0,220}line: ""/,
  );
});
