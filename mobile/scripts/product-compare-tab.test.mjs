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

test("эндпоинт и ключ запроса совпадают с вебом", () => {
  const web = readRepoFile("client/src/entities/product/api/fetchComparableProducts.js");
  const mobile = readMobileFile("entities/product/api/fetchComparableProducts.ts");

  for (const source of [web, mobile]) {
    assert.match(source, /\/product\/\$\{encodeURIComponent\(id\)\}\/compare/);
  }

  const webQuery = readRepoFile(
    "client/src/entities/product/model/useComparableProductsQuery.js",
  );
  const mobileQuery = readMobileFile(
    "entities/product/model/useComparableProductsQuery.ts",
  );
  for (const source of [webQuery, mobileQuery]) {
    assert.match(source, /"compare", id/);
    assert.match(source, /staleTime: 60_000/);
  }
});

test("пустой id не ходит в сеть", () => {
  const mobile = readMobileFile("entities/product/api/fetchComparableProducts.ts");
  // Ранний выход до apiClient.get.
  assert.ok(mobile.indexOf("return [];") < mobile.indexOf("apiClient.get"));

  const query = readMobileFile("entities/product/model/useComparableProductsQuery.ts");
  assert.match(query, /enabled: enabled && id\.length > 0/);
});

test("вкладка стоит между «Похожими» и «Рассрочкой», как в вебе", () => {
  const mobile = readMobileFile("entities/product/model/useProductDetailTabs.ts");
  const tabsBody = mobile.slice(mobile.indexOf("const tabs = useMemo"));

  const similarAt = tabsBody.indexOf('id: "similar"');
  const compareAt = tabsBody.indexOf('id: "compare"');
  const installmentAt = tabsBody.indexOf('id: "installment"');

  assert.ok(similarAt >= 0 && compareAt >= 0 && installmentAt >= 0);
  assert.ok(similarAt < compareAt, "«Сравнение» должно идти после «Похожих»");
  assert.ok(compareAt < installmentAt, "«Сравнение» должно идти до «Рассрочки»");

  const web = readRepoFile(
    "client/src/entities/product/ui/product-details-modal/ProductDetailsModalTabs.jsx",
  );
  const webSimilarAt = web.indexOf('id: "similar"');
  const webCompareAt = web.indexOf('id: "compare"');
  const webInstallmentAt = web.indexOf('id: "installment"');
  assert.ok(webSimilarAt < webCompareAt && webCompareAt < webInstallmentAt);
});

test("гейт вкладки — как в вебе: есть у любого товара", () => {
  const mobile = readMobileFile("entities/product/model/useProductDetailTabs.ts");
  assert.match(mobile, /const showCompareTab = product\?\._id != null;/);
  // Из-за этого таб-бар виден всегда — так же ведёт себя веб.
  assert.match(mobile, /showCompareTab \|\|/);

  const web = readRepoFile(
    "client/src/entities/product/ui/product-details-modal/useProductDetailsModalTabs.js",
  );
  assert.match(web, /const showCompareTab = product\?\._id != null;/);
  assert.match(web, /showCompareTab;/);
});

test("экран товара рендерит вкладку и учитывает её в alt-раскладке", () => {
  const screen = readMobileFile("app/product/[id].tsx");
  assert.match(screen, /activeTab === "compare" \? \(/);
  assert.match(screen, /<ProductCompareTab productId=\{productId\} enabled \/>/);
  assert.match(screen, /activeTab === "compare" \|\|/);
});

test("тизер показывается только когда есть что сравнивать", () => {
  const teaser = readMobileFile("features/product-detail/ui/ProductDetailsCompareTeaser.tsx");
  assert.match(teaser, /\(compareQuery\.data \?\? \[\]\)\.length === 0/);
  assert.match(teaser, /return null;/);

  const web = readRepoFile(
    "client/src/entities/product/ui/product-details-modal/ProductDetailsCompareTeaser.jsx",
  );
  assert.match(web, /products\.length === 0/);

  const detailsTab = readMobileFile("features/product-detail/ui/ProductDetailsDetailsTab.tsx");
  assert.match(detailsTab, /onOpenCompareTab/);
});

test("копирайт совпадает с вебом слово в слово", () => {
  const web = readRepoFile("client/src/shared/config/copy/catalog.js");
  const mobile = readMobileFile("shared/config/appUiCopy.ts");

  for (const line of [
    'TAB: "Сравнение"',
    'SECTION_ARIA: "Сравнение с похожими товарами"',
    'LOADING: "Подбираем товары для сравнения…"',
    'EMPTY: "Нет данных для сравнения"',
    'DETAILS_TEASER_TITLE: "Сравнить товар"',
    'DETAILS_TEASER_SUBTITLE: "С похожими предложениями"',
  ]) {
    assert.ok(web.includes(line), `нет в вебе: ${line}`);
    assert.ok(mobile.includes(line), `нет в мобилке: ${line}`);
  }
});
