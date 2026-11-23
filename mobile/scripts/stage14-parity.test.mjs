import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("14.1 storefront smoke: shelves + luckybox + wheel + QR + share + social", () => {
  const page = readMobile("features/seller-products-page/ui/SellerProductsPage.tsx");
  const web = readClient("pages/seller-products/ui/SellerProductsPage.jsx");

  assert.match(web, /SellerLuckyBoxSection|SellerLuckyBox/);
  assert.match(web, /SellerFortuneWheelSection|SellerFortuneWheel/);
  assert.match(web, /SellerQrButton|SellerSocialLinksButton|SellerShare/);

  assert.match(page, /SellerLuckyBoxGame/);
  assert.match(page, /SellerFortuneWheelGame/);
  assert.match(page, /SellerQrButton/);
  assert.match(page, /SellerSocialLinksButton/);
  assert.match(page, /SellerShareLinkButton/);
  assert.match(page, /fetchPublicSellerShelves|shelvesQuery/);
  assert.match(page, /SHELF_FILTER_ALL/);
  assert.match(page, /storefrontActions/);
});

test("14.2 OneC shelves read-only tree + catalog filter", () => {
  const page = readMobile("features/seller-products-page/ui/SellerProductsPage.tsx");
  const api = readMobile("entities/seller-shelf/api/sellerShelfApi.ts");
  const keys = readMobile("entities/seller-shelf/model/sellerShelfQueryKeys.ts");
  const query = readMobile(
    "entities/seller-shelf/model/usePublicSellerOneCShelvesQuery.ts",
  );
  const rows = readMobile("entities/seller-shelf/lib/buildOneCShelfRows.ts");
  const fetchProducts = readMobile("entities/user/api/fetchUserProducts.ts");
  const infinite = readMobile(
    "entities/user/model/useSellerProductsInfiniteQuery.ts",
  );
  const productKeys = readMobile("entities/user/model/sellerProductsQueryKeys.ts");
  const styles = readMobile("shared/theme/sellerFlowStyles.ts");

  const webPage = readClient("pages/seller-products/ui/SellerProductsPage.jsx");
  const webApi = readClient("entities/seller-shelf/api/sellerShelfApi.js");
  const webQuery = readClient(
    "entities/seller-shelf/model/usePublicSellerOneCShelvesQuery.js",
  );

  assert.match(webPage, /usePublicSellerOneCShelvesQuery/);
  assert.match(webPage, /onecPath/);
  assert.match(webPage, /onecGroupId/);
  assert.match(webApi, /\/seller-shelf\/seller\/\$\{encodeURIComponent\(sellerId\)\}\/onec/);
  assert.match(webQuery, /publicOneCBySeller/);

  assert.match(api, /fetchPublicSellerOneCShelves/);
  assert.match(api, /\/seller-shelf\/seller\/\$\{encodeURIComponent\(sellerId\)\}\/onec/);
  assert.match(keys, /publicOneCBySeller/);
  assert.match(query, /fetchPublicSellerOneCShelves/);
  assert.match(rows, /buildOneCShelfRows/);
  assert.match(page, /usePublicSellerOneCShelvesQuery/);
  assert.match(page, /onecPath/);
  assert.match(page, /buildOneCShelfRows/);
  assert.match(page, /selectedOnecGroupId/);
  assert.match(page, /shelvesRowNested/);
  assert.match(fetchProducts, /onecGroupId/);
  assert.match(infinite, /onecGroupId/);
  assert.match(productKeys, /onecGroupId/);
  assert.match(styles, /shelvesRowNested/);
});
