import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Модули без alias-импортов значений — Node стрипает типы и гоняет логику.
import { ensureSingleDefaultUserSavedAddress } from "../entities/address/lib/ensureSingleDefaultUserSavedAddress.ts";
import { createUserSavedAddressId } from "../entities/address/lib/createUserSavedAddressId.ts";
import {
  findDuplicateUserSavedAddressKey,
  isUserSavedAddressesEqual,
} from "../entities/address/lib/isUserSavedAddressesEqual.ts";
import { appendUserAddressesToPayload } from "../entities/address/lib/appendUserAddressesToPayload.ts";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");

const readMobileFile = (relativePath) =>
  readFileSync(resolve(mobileRoot, relativePath), "utf8");
const readRepoFile = (relativePath) =>
  readFileSync(resolve(repoRoot, relativePath), "utf8");

const address = (over = {}) => ({
  id: "a",
  label: "Дом",
  line: "г Москва, ул Тверская, д 1",
  flat: "12",
  fiasId: "",
  geo: null,
  regionCode: null,
  selectedFromSuggest: true,
  isDefault: false,
  ...over,
});

test("основной адрес всегда ровно один", () => {
  const none = ensureSingleDefaultUserSavedAddress([
    address({ id: "a" }),
    address({ id: "b" }),
  ]);
  assert.deepEqual(
    none.map((item) => item.isDefault),
    [true, false],
    "без помеченных основным становится первый",
  );

  const many = ensureSingleDefaultUserSavedAddress([
    address({ id: "a" }),
    address({ id: "b", isDefault: true }),
    address({ id: "c", isDefault: true }),
  ]);
  assert.deepEqual(
    many.map((item) => item.isDefault),
    [false, true, false],
    "из нескольких помеченных остаётся первый",
  );

  assert.deepEqual(ensureSingleDefaultUserSavedAddress([]), []);
  assert.deepEqual(ensureSingleDefaultUserSavedAddress(undefined), []);
});

test("повтор ловится по паре «улица + квартира»", () => {
  assert.equal(
    findDuplicateUserSavedAddressKey([address({ id: "a" }), address({ id: "b" })]),
    // одинаковые line+flat при разных id — всё равно дубль
    findDuplicateUserSavedAddressKey([address({ id: "a" }), address({ id: "b" })]),
  );
  assert.ok(
    findDuplicateUserSavedAddressKey([address({ id: "a" }), address({ id: "b" })]) != null,
  );
  assert.equal(
    findDuplicateUserSavedAddressKey([
      address({ id: "a", flat: "12" }),
      address({ id: "b", flat: "13" }),
    ]),
    null,
    "разные квартиры — не дубль",
  );
});

test("сравнение списков не зависит от порядка", () => {
  const left = [address({ id: "a" }), address({ id: "b", flat: "13" })];
  const right = [address({ id: "b", flat: "13" }), address({ id: "a" })];
  assert.equal(isUserSavedAddressesEqual(left, right), true);

  assert.equal(
    isUserSavedAddressesEqual(left, [address({ id: "a" })]),
    false,
    "разная длина — не равны",
  );
  assert.equal(
    isUserSavedAddressesEqual(left, [
      address({ id: "a", label: "Работа" }),
      address({ id: "b", flat: "13" }),
    ]),
    false,
    "метка входит в сравнение",
  );
});

test("в PATCH уходит нормализованный список", () => {
  const payload = {};
  appendUserAddressesToPayload(payload, [
    address({ id: " a ", label: "  ", flat: " 12 ", isDefault: true }),
  ]);

  assert.deepEqual(payload.userAddresses, [
    {
      id: "a",
      label: null,
      line: "г Москва, ул Тверская, д 1",
      flat: "12",
      isDefault: true,
    },
  ]);
});

test("id нового адреса уникальный и непустой", () => {
  const ids = new Set(Array.from({ length: 50 }, () => createUserSavedAddressId()));
  assert.equal(ids.size, 50);
  for (const id of ids) {
    assert.ok(id.length > 0);
  }
});

test("форма профиля отдаёт книгу и не шлёт легаси-адрес", () => {
  const patch = readMobileFile("entities/user/lib/buildPatchUserProfileBody.ts");
  assert.match(patch, /appendUserAddressesToPayload\(body, form\.savedAddresses\)/);
  // Контракт запрещает userAddress вместе с userAddresses.
  assert.doesNotMatch(patch, /body\.userAddress\b/);
  assert.doesNotMatch(patch, /body\.userAddressFlat\b/);

  const contract = readRepoFile("contract/src/userProfile.js");
  assert.match(contract, /USER_ADDRESS_PATCH_CONFLICT_MESSAGE/);

  const web = readRepoFile("client/src/entities/user/lib/buildPatchUserProfileBody.js");
  assert.doesNotMatch(web, /body\.userAddress\b/, "в вебе легаси-поля тоже нет");
});

test("незакрытый черновик блокирует сохранение профиля", () => {
  const form = readMobileFile("features/profile-edit/ui/EditProfileForm.tsx");
  assert.match(form, /if \(addressDraftOpen\)/);
  assert.match(form, /USER_SAVED_ADDRESSES_UI\.ERROR_DRAFT_OPEN/);
  assert.match(form, /onEditingChange=\{setAddressDraftOpen\}/);
});

test("список валидируется вместе с остальной формой", () => {
  const validate = readMobileFile("entities/user/lib/validateEditProfileForm.ts");
  assert.match(validate, /validateUserSavedAddressesForm\(form\.savedAddresses\)/);

  const web = readRepoFile("client/src/entities/user/lib/validateEditProfileForm.js");
  assert.match(web, /validateUserSavedAddressesForm\(form\.savedAddresses\)/);
});

test("подписи редактора совпадают с вебом", () => {
  const web = readRepoFile("client/src/shared/config/copy/cart-checkout.js");
  const mobile = readMobileFile("shared/config/appUiCopy.ts");

  for (const line of [
    'ADD: "Добавить адрес"',
    'EDIT: "Изменить"',
    'REMOVE: "Удалить"',
    'SAVE: "Сохранить адрес"',
    'EMPTY: "Адреса не добавлены"',
    'REMOVE_CONFIRM: "Удалить этот адрес?"',
    'ERROR_DUPLICATE: "Такой адрес уже добавлен"',
    'ERROR_DEFAULT_REQUIRED: "Укажите адрес по умолчанию"',
    'ERROR_DRAFT_OPEN: "Сохраните или отмените редактирование адреса"',
  ]) {
    assert.ok(web.includes(line), `нет в вебе: ${line}`);
    assert.ok(mobile.includes(line), `нет в мобилке: ${line}`);
  }
});

test("первый адрес в книге сразу становится основным", () => {
  const editor = readMobileFile("entities/address/ui/UserSavedAddressesEditor.tsx");
  assert.match(editor, /isDefault: isNew \? addresses\.length === 0 : draft\.isDefault/);

  const web = readRepoFile("client/src/entities/address/ui/UserSavedAddressesEditor.jsx");
  assert.match(web, /addresses\.length === 0 : draft\.isDefault/);
});
