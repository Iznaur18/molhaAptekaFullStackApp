import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Модуль без alias-импортов — Node стрипает типы и гоняет настоящие ключи.
import { productPromoCodeQueryKeys } from "../entities/product-promo-code/model/productPromoCodeQueryKeys.ts";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");

const readMobileFile = (relativePath) =>
  readFileSync(resolve(mobileRoot, relativePath), "utf8");
const readRepoFile = (relativePath) =>
  readFileSync(resolve(repoRoot, relativePath), "utf8");

test("ключи запросов совпадают с вебом", () => {
  assert.deepEqual(productPromoCodeQueryKeys.all, ["product-promo-code"]);
  assert.deepEqual(productPromoCodeQueryKeys.list("p1"), [
    "product-promo-code",
    "list",
    "p1",
  ]);
  assert.deepEqual(productPromoCodeQueryKeys.appliedMine(), [
    "product-promo-code",
    "applied-mine",
  ]);

  const web = readRepoFile(
    "client/src/entities/product-promo-code/model/productPromoCodeQueryKeys.js",
  );
  assert.match(web, /all: \["product-promo-code"\]/);
  assert.match(web, /"list", productId/);
  assert.match(web, /"applied-mine"/);
});

test("инлайновых копий ключа больше нет", () => {
  for (const relativePath of [
    "features/product-detail/ui/ProductPromoCodeActivateSheet.tsx",
    "app/(tabs)/cart.tsx",
  ]) {
    const source = readMobileFile(relativePath);
    assert.doesNotMatch(
      source,
      /\["product-promo-code", "applied-mine"\]/,
      `${relativePath}: ключ должен браться из модуля`,
    );
    assert.match(source, /productPromoCodeQueryKeys\.appliedMine\(\)/);
  }
});

test("пустой код пропускается, а не роняет сохранение", () => {
  const modal = readMobileFile("entities/product/ui/ProductPromoCodesModal.tsx");
  assert.match(modal, /if \(!code\) \{\s*\r?\n\s*continue;/);

  const web = readRepoFile("client/src/entities/product/ui/ProductPromoCodesModal.jsx");
  assert.match(web, /if \(!code\) \{\s*\r?\n\s*continue;/);
});

test("границы скидки и активаций берутся из контракта", () => {
  const modal = readMobileFile("entities/product/ui/ProductPromoCodesModal.tsx");
  for (const name of [
    "PRODUCT_PROMO_DISCOUNT_PERCENT_MIN",
    "PRODUCT_PROMO_DISCOUNT_PERCENT_MAX",
    "PRODUCT_PROMO_MAX_ACTIVATIONS_MIN",
    "PRODUCT_PROMO_MAX_ACTIVATIONS_MAX",
    "PRODUCT_PROMO_CODES_MAX_ACTIVE",
    "PRODUCT_PROMO_CODE_MAX_LENGTH",
  ]) {
    assert.ok(modal.includes(name), `нет ${name}`);
  }
  // Ни одного зашитого числа вместо константы.
  assert.doesNotMatch(modal, /discountPercent < 1\b/);
});

test("лимит активных кодов не даёт добавить лишнюю карточку", () => {
  const modal = readMobileFile("entities/product/ui/ProductPromoCodesModal.tsx");
  assert.match(modal, /activeCount >= PRODUCT_PROMO_CODES_MAX_ACTIVE/);
  assert.match(modal, /setError\(PRODUCT_PROMO_CODE_UI\.MAX_ACTIVE\)/);
});

test("строка управления стоит после горящей скидки, как в вебе", () => {
  const orderIn = (source) => ({
    flash: source.indexOf("MANAGE_TITLE"),
    promo: source.indexOf("MANAGE_PROMO_CODES_TITLE"),
    loyalty: source.indexOf("MANAGE_LOYALTY_TITLE"),
  });

  const mobile = orderIn(readMobileFile("entities/product/ui/ProductEditManageSection.tsx"));
  const web = orderIn(
    readRepoFile("client/src/entities/product/ui/ProductEditManageSection.jsx"),
  );

  for (const [name, at] of [
    ["mobile", mobile],
    ["web", web],
  ]) {
    assert.ok(at.promo >= 0 && at.loyalty >= 0, name);
    assert.ok(at.flash < at.promo, `${name}: промокоды после горящей скидки`);
    assert.ok(at.promo < at.loyalty, `${name}: промокоды до баллов`);
  }
});

test("сохранение обновляет признак активных кодов у товара", () => {
  const promotion = readMobileFile("features/product-promotion/ui/ProductPromotionModal.tsx");
  assert.match(promotion, /<ProductPromoCodesModal/);
  assert.match(promotion, /productHasActivePromoCodes: payload\.productHasActivePromoCodes/);

  const web = readRepoFile("client/src/entities/product/ui/ProductPromotionModal.jsx");
  assert.match(web, /productHasActivePromoCodes: payload\.productHasActivePromoCodes/);
});

test("подписи совпадают с вебом", () => {
  const web = readRepoFile("client/src/shared/config/copy/product-detail.js");
  const webCreate = readRepoFile("client/src/shared/config/copy/product-create.js");
  const mobile = readMobileFile("shared/config/appUiCopy.ts");

  for (const line of [
    'MODAL_TITLE: "Промокоды товара"',
    'ADD: "Добавить промокод"',
    'FIELD_CODE: "Код"',
    'FIELD_PERCENT: "Скидка, %"',
    'FIELD_MAX: "Макс. активаций"',
    'MAX_ACTIVE: "Уже 10 активных промокодов"',
  ]) {
    assert.ok(web.includes(line), `нет в вебе: ${line}`);
    assert.ok(mobile.includes(line), `нет в мобилке: ${line}`);
  }

  assert.ok(webCreate.includes("MANAGE_PROMO_CODES_TITLE"));
  assert.ok(mobile.includes("MANAGE_PROMO_CODES_TITLE"));
});
