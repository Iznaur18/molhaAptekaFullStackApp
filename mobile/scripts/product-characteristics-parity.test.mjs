import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { resolveCategoryDefaultCharacteristicRows } from "../entities/product/lib/resolveCategoryDefaultCharacteristicRows.ts";
import { validateProductCharacteristicsRows } from "../entities/product/lib/validateProductCharacteristicsRows.ts";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readMobileFile = (p) => readFileSync(resolve(mobileRoot, p), "utf8");

test("пустые строки характеристик не ошибка, половинчатые — ошибка", () => {
  assert.equal(validateProductCharacteristicsRows([]), null);
  // Заготовка, добавленная кнопкой и не заполненная, шаг не блокирует.
  assert.equal(validateProductCharacteristicsRows([{ key: "", value: "" }]), null);
  assert.equal(validateProductCharacteristicsRows([{ key: " ", value: "  " }]), null);
  assert.equal(validateProductCharacteristicsRows([{ key: "Цвет", value: "синий" }]), null);

  assert.match(
    validateProductCharacteristicsRows([{ key: "Цвет", value: "" }]),
    /и ключ, и значение/,
  );
  assert.match(
    validateProductCharacteristicsRows([{ key: "", value: "синий" }]),
    /и ключ, и значение/,
  );
});

test("дубль ключа ловится без оглядки на регистр", () => {
  const error = validateProductCharacteristicsRows([
    { key: "Цвет", value: "синий" },
    { key: "  цвет ", value: "красный" },
  ]);
  assert.match(error, /Дубликат ключа/);
  // В сообщении — та форма ключа, которую продавец ввёл первой.
  assert.match(error, /«Цвет»/);
});

test("длина ключа и значения ограничена контрактом", () => {
  assert.match(
    validateProductCharacteristicsRows([{ key: "я".repeat(200), value: "x" }]),
    /Ключ характеристики не длиннее/,
  );
  assert.match(
    validateProductCharacteristicsRows([{ key: "Цвет", value: "я".repeat(2000) }]),
    /Значение характеристики не длиннее/,
  );

  const lib = readMobileFile("entities/product/lib/validateProductCharacteristicsRows.ts");
  assert.ok(
    lib.includes("PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS"),
    "лимиты обязаны браться из контракта, а не числом",
  );
  assert.doesNotMatch(lib, /length > \d+\b/, "лимит не должен быть зашит числом");
});

test("шаг «О товаре» проверяет характеристики", () => {
  const source = readMobileFile("features/create-product/ui/CreateProductScreen.tsx");
  assert.ok(
    source.includes("return validateProductCharacteristicsRows(form.characteristicRows);"),
    "шаг молча теряет половинчатые строки",
  );
});

const state = (over = {}) => ({
  productCategoryId: "cat-1",
  categoryDefaultCharacteristicKeys: ["Цвет", "Размер"],
  characteristicRows: [],
  characteristicsSellerTouched: false,
  characteristicsAutoAppliedForCategoryId: null,
  ...over,
});

test("ключи категории подставляются пустыми строками", () => {
  const patch = resolveCategoryDefaultCharacteristicRows(state());
  assert.deepEqual(patch.characteristicRows, [
    { key: "Цвет", value: "" },
    { key: "Размер", value: "" },
  ]);
  assert.equal(patch.characteristicsAutoAppliedForCategoryId, "cat-1");
  assert.equal(patch.characteristicsSellerTouched, false);

  // Пустые и пробельные ключи в заготовку не попадают.
  assert.deepEqual(
    resolveCategoryDefaultCharacteristicRows(
      state({ categoryDefaultCharacteristicKeys: ["Цвет", "  ", ""] }),
    ).characteristicRows,
    [{ key: "Цвет", value: "" }],
  );
});

test("правки продавца заготовками не затираются", () => {
  assert.equal(
    resolveCategoryDefaultCharacteristicRows(
      state({
        characteristicsSellerTouched: true,
        characteristicRows: [{ key: "Своё", value: "значение" }],
      }),
    ),
    null,
  );

  // Повторный вход на шаг с той же категорией ничего не трогает: иначе
  // заполненные значения обнулялись бы при каждом возврате.
  assert.equal(
    resolveCategoryDefaultCharacteristicRows(
      state({ characteristicsAutoAppliedForCategoryId: "cat-1" }),
    ),
    null,
  );

  // А смена категории заготовку пересобирает.
  const next = resolveCategoryDefaultCharacteristicRows(
    state({
      productCategoryId: "cat-2",
      categoryDefaultCharacteristicKeys: ["Материал"],
      characteristicsAutoAppliedForCategoryId: "cat-1",
    }),
  );
  assert.deepEqual(next.characteristicRows, [{ key: "Материал", value: "" }]);
  assert.equal(next.characteristicsAutoAppliedForCategoryId, "cat-2");

  // Ни категории, ни строк, ни следа подстановки — менять нечего.
  assert.equal(
    resolveCategoryDefaultCharacteristicRows(
      state({ productCategoryId: null, categoryDefaultCharacteristicKeys: [] }),
    ),
    null,
  );
});

test("ключи категории доезжают от API до мастера", () => {
  // zod-схема режет неизвестные поля — без этой строки ключи терялись молча.
  const parser = readMobileFile("shared/api/parseApiContract.ts");
  assert.ok(
    parser.includes("defaultCharacteristicKeys: z.array(z.string()).optional()"),
    "схема категорий срезает ключи характеристик",
  );

  const search = readMobileFile(
    "entities/product-category-tree/api/fetchProductCategorySearch.ts",
  );
  assert.ok(
    search.includes("defaultCharacteristicKeys"),
    "выбор категории поиском теряет ключи",
  );

  const picker = readMobileFile("features/create-product/ui/CreateProductCategoryPicker.tsx");
  assert.ok(
    picker.includes("onSelect(categoryId, fullLabel, defaultCharacteristicKeys)"),
    "пикер не отдаёт ключи наверх",
  );

  const screen = readMobileFile("features/create-product/ui/CreateProductScreen.tsx");
  assert.ok(
    screen.includes("resolveCategoryDefaultCharacteristicRows({"),
    "мастер не подставляет ключи категории",
  );
  // Любая ручная правка строк должна помечать форму тронутой.
  assert.equal(
    (screen.match(/characteristicsSellerTouched: true,/g) ?? []).length,
    3,
    "добавление, удаление и правка строки обязаны ставить sellerTouched",
  );
});
