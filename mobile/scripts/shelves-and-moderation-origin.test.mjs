import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { resolveProductModerationOriginPoint } from "../entities/product/lib/productModerationOriginPoint.ts";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");
const readMobileFile = (p) => readFileSync(resolve(mobileRoot, p), "utf8");
const readRepoFile = (p) => readFileSync(resolve(repoRoot, p), "utf8");

const coords = (lat, lon) => `${lat}, ${lon}`;

test("точка отправления показывается только при выключенном самовывозе", () => {
  const base = {
    productPickupAddress: "г Москва, ул Арбат, д 5",
    productPickupLat: 55.75,
    productPickupLon: 37.59,
  };

  // Самовывоз включён — адрес и так виден покупателю, дублировать не нужно.
  assert.equal(
    resolveProductModerationOriginPoint({ ...base, productPickupEnabled: true }, coords),
    null,
  );
  assert.equal(resolveProductModerationOriginPoint(base, coords), null);

  const origin = resolveProductModerationOriginPoint(
    { ...base, productPickupEnabled: false },
    coords,
  );
  assert.equal(origin.address, "г Москва, ул Арбат, д 5");
  assert.equal(origin.coordsText, "55.75, 37.59");
});

test("без адреса и координат открывать на карте нечего", () => {
  assert.equal(resolveProductModerationOriginPoint({ productPickupEnabled: false }, coords), null);
  assert.equal(resolveProductModerationOriginPoint(null, coords), null);

  // Только адрес — точка есть, координат нет.
  const byAddress = resolveProductModerationOriginPoint(
    { productPickupEnabled: false, productPickupAddress: "г Тула, ул Мира, д 3" },
    coords,
  );
  assert.equal(byAddress.coordsText, null);
  assert.equal(byAddress.lat, null);

  // Только координаты — тоже точка.
  const byCoords = resolveProductModerationOriginPoint(
    { productPickupEnabled: false, productPickupLat: 55.7, productPickupLon: 37.6 },
    coords,
  );
  assert.equal(byCoords.address, "");
  assert.equal(byCoords.coordsText, "55.7, 37.6");
});

test("пустая строка координат — это не ноль", () => {
  // `Number("")` и `Number(null)` дают 0 — Гвинейский залив вместо «не указано».
  const origin = resolveProductModerationOriginPoint(
    {
      productPickupEnabled: false,
      productPickupAddress: "г Тула, ул Мира, д 3",
      productPickupLat: "",
      productPickupLon: null,
    },
    coords,
  );
  assert.equal(origin.lat, null);
  assert.equal(origin.lon, null);
  assert.equal(origin.coordsText, null);
});

test("карточка модерации рисует точку и ссылку на карту", () => {
  const card = readMobileFile("entities/product/ui/ProductModerationQueueCard.tsx");
  assert.ok(card.includes("resolveProductModerationOriginPoint("), "нет разбора точки");
  assert.ok(card.includes("openYandexMapsRoute("), "нет открытия карты");
  assert.ok(card.includes("PRODUCT_MODERATION_PAGE_UI.OPEN_MAP"), "нет подписи ссылки");

  // Покупателю склад показывать нельзя — панель товара это не трогает.
  const panel = readMobileFile("features/product-detail/ui/ProductPickupDetailsPanel.tsx");
  assert.ok(
    !panel.includes("resolveProductModerationOriginPoint"),
    "адрес склада не должен утекать на карточку товара",
  );

  const copy = readMobileFile("shared/config/appUiCopy.ts");
  for (const key of ["ORIGIN_LABEL", "COORDS_LABEL", "COORDS_EMPTY", "COORDS_VALUE", "OPEN_MAP"]) {
    assert.ok(copy.includes(key), `нет ${key}`);
  }
});

test("полки умеют то же, что в вебе", () => {
  const panel = readMobileFile("features/my-products-page/ui/MyProductsShelvesPanel.tsx");
  const webPanel = readRepoFile(
    "client/src/entities/seller-shelf/ui/MyProductsShelvesPanel.jsx",
  );

  // Набор ключей копирайта обязан совпасть с вебом — это и есть паритет.
  const keysOf = (source) =>
    new Set([...source.matchAll(/SELLER_SHELF_UI\.([A-Z_]+)/g)].map((m) => m[1]));
  const webKeys = keysOf(webPanel);
  const mobileKeys = keysOf(panel);
  // MOVE_UP/MOVE_DOWN на мобилке — видимые стрелки, в вебе — aria-подписи.
  const renamed = { MOVE_UP_ARIA: "MOVE_UP", MOVE_DOWN_ARIA: "MOVE_DOWN" };
  const missing = [...webKeys]
    .map((key) => renamed[key] ?? key)
    .filter((key) => !mobileKeys.has(key));
  assert.deepEqual(missing, [], `на мобилке не хватает: ${missing.join(", ")}`);

  assert.ok(panel.includes("patchSellerShelf("), "нет переименования полки");
  assert.ok(panel.includes("renamingId === shelf._id"), "нет режима переименования");
});

test("лимиты полок берутся с сервера, а не зашиты числом", () => {
  const panel = readMobileFile("features/my-products-page/ui/MyProductsShelvesPanel.tsx");
  assert.ok(panel.includes("shelvesQuery.data?.maxShelves"), "лимит полок не читается из ответа");
  assert.ok(panel.includes("shelvesQuery.data?.nameMaxChars"), "длина имени не читается из ответа");
  assert.ok(!panel.includes("shelves.length >= 10"), "лимит полок зашит числом");
  assert.ok(!/maxLength=\{30\}/.test(panel), "длина имени зашита числом");

  // Запасные значения обязаны идти из контракта.
  assert.ok(panel.includes("SELLER_SHELF_MAX_PER_SELLER"), "нет запасного лимита из контракта");
  const contract = readRepoFile("contract/src/sellerShelf.js");
  assert.match(contract, /SELLER_SHELF_MAX_PER_SELLER = 10/);
  assert.match(contract, /SELLER_SHELF_NAME_MAX_CHARS = 30/);
});
