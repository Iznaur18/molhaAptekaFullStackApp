import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");

const readMobileFile = (relativePath) =>
  readFileSync(resolve(mobileRoot, relativePath), "utf8");
const readRepoFile = (relativePath) =>
  readFileSync(resolve(repoRoot, relativePath), "utf8");

test("подписи тумблера совпадают с вебом", () => {
  const webCreate = readRepoFile("client/src/shared/config/copy/product-create.js");
  const webCatalog = readRepoFile("client/src/shared/config/copy/catalog.js");
  const mobile = readMobileFile("shared/config/appUiCopy.ts");

  assert.ok(webCreate.includes('MANAGE_QA_TITLE: "Вопросы и ответы"'));
  assert.ok(
    webCreate.includes('MANAGE_QA_HINT: "Покупатели смогут задавать вопросы о товаре"'),
  );
  assert.ok(webCatalog.includes('QA_TOGGLE_PENDING: "Обновление…"'));

  assert.ok(mobile.includes('MANAGE_QA_TITLE: "Вопросы и ответы"'));
  assert.ok(
    mobile.includes('MANAGE_QA_HINT: "Покупатели смогут задавать вопросы о товаре"'),
  );
  assert.ok(mobile.includes('QA_TOGGLE_PENDING: "Обновление…"'));
});

test("гейт строки — как в вебе: есть обработчик и право на правку", () => {
  const mobile = readMobileFile("entities/product/ui/ProductEditManageSection.tsx");
  const web = readRepoFile("client/src/entities/product/ui/ProductEditManageSection.jsx");

  for (const source of [mobile, web]) {
    assert.match(source, /showQaToggle = typeof onSetQa === "function" && canEdit/);
    assert.match(source, /product\.productQaEnabled === true/);
  }
});

test("тумблер шлёт productQaEnabled и блокируется на время запроса", () => {
  const actions = readMobileFile("features/my-products-page/model/useMyProductsPageActions.ts");
  assert.match(actions, /body: \{ productQaEnabled: qaEnabled \}/);
  assert.match(actions, /setTogglingQaProductId\(normalizedProductId\)/);
  assert.match(actions, /setTogglingQaProductId\(null\)/);

  const section = readMobileFile("entities/product/ui/ProductEditManageSection.tsx");
  assert.match(section, /isQaTogglePending \|\|/, "pending участвует в общей блокировке");

  const web = readRepoFile("client/src/widgets/app-shell/model/useHomeProductActions.js");
  assert.match(web, /body: \{ productQaEnabled: qaEnabled \}/);
});

test("строка стоит между аукционом и розыгрышем, как в вебе", () => {
  const orderIn = (source) => ({
    auction: source.indexOf("MANAGE_AUCTION_TITLE"),
    qa: source.indexOf("MANAGE_QA_TITLE"),
    raffle: source.indexOf("MANAGE_RAFFLE_TITLE"),
  });

  const mobile = orderIn(readMobileFile("entities/product/ui/ProductEditManageSection.tsx"));
  const web = orderIn(
    readRepoFile("client/src/entities/product/ui/ProductEditManageSection.jsx"),
  );

  for (const [name, at] of [
    ["mobile", mobile],
    ["web", web],
  ]) {
    assert.ok(at.auction >= 0 && at.qa >= 0 && at.raffle >= 0, name);
    assert.ok(at.auction < at.qa, `${name}: Q&A должен идти после аукциона`);
    assert.ok(at.qa < at.raffle, `${name}: Q&A должен идти до розыгрыша`);
  }
});

test("проводка доходит от страницы «мои товары» до строки", () => {
  const page = readMobileFile("features/my-products-page/ui/MyProductsPage.tsx");
  assert.match(page, /onSetProductQa=\{pageActions\.handleSetProductQa\}/);
  assert.match(page, /isQaTogglePending=\{pageActions\.isQaTogglePending\}/);

  const modal = readMobileFile("features/product-promotion/ui/ProductPromotionModal.tsx");
  assert.match(modal, /onSetQa=\{onSetProductQa\}/);
  assert.match(modal, /isQaTogglePending=\{isQaTogglePending\}/);
});

test("вкладка Q&A по-прежнему гейтится этим же полем", () => {
  const tabs = readMobileFile("entities/product/model/useProductDetailTabs.ts");
  // Покупателю вкладка видна только при включённом Q&A, продавцу — всегда.
  assert.match(tabs, /product\.productQaEnabled === true/);
});
