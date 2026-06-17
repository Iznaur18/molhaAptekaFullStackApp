import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UTILS_DIR = path.join(__dirname, "../utils");
const TARGET_DIR = path.join(__dirname, "../services/product");

const MOVED_FILES = [
  "applyProductSearchBlobToProductWrite.js",
  "assertProductLoyaltyPointsPerUnit.js",
  "attachProductSellerSnapshots.js",
  "buildProductAtlasSearchStage.js",
  "buildProductCatalogSearchQuery.js",
  "buildProductSearchBlob.js",
  "catalogProductsResponseCache.js",
  "confirmedSellerCatalog.js",
  "findCatalogProductsPage.js",
  "getProductCategoryDescendantIds.js",
  "isAtlasSearchUnavailableError.js",
  "isProductAtlasSearchEnabled.js",
  "mergeProductCatalogCategoryFilter.js",
  "mergeProductImageUrlsFromBody.js",
  "normalizeProductCharacteristics.js",
  "normalizeProductSearchText.js",
  "premiumSellerCatalog.js",
  "productAuction.js",
  "productCatalogAtlasSearch.js",
  "productCatalogPromotionSort.js",
  "productCatalogQuery.js",
  "productDiscount.js",
  "productModeration.js",
  "productOrderLocks.js",
  "productPreviewVideo.js",
  "productPriceOfferHelpers.js",
  "productPromotionHelpers.js",
  "productReviewHelpers.js",
  "productSaleCity.js",
  "productSoldQuantityDenorm.js",
  "productStock.js",
  "resolveProductCategoryWrite.js",
  "resolveProductSearchIntent.js",
  "productSearchSynonymCache.js",
  "sellerCatalogLoyaltyPoints.js",
  "sellerListedProductCount.js",
  "sellerProductsLimit.js",
];

const RAFFLE_IMPORTS = new Set(["raffleHelpers.js"]);

const rewriteImports = (source) => {
  let next = source
    .replaceAll('from "../constants/', 'from "../../constants/')
    .replaceAll('from "../models/', 'from "../../models/')
    .replaceAll('from "../errors/', 'from "../../errors/')
    .replaceAll('from "../db/', 'from "../../db/');

  next = next.replace(
    /from "\.\/([^"]+\.js)"/g,
    (match, relPath) => {
      if (MOVED_FILES.includes(relPath)) {
        return `from "./${relPath}"`;
      }
      if (RAFFLE_IMPORTS.has(relPath)) {
        return `from "../raffle/${relPath}"`;
      }
      return `from "../../utils/${relPath}"`;
    },
  );

  return next;
};

fs.mkdirSync(TARGET_DIR, { recursive: true });

for (const fileName of MOVED_FILES) {
  const fromPath = path.join(UTILS_DIR, fileName);
  const toPath = path.join(TARGET_DIR, fileName);
  const source = fs.readFileSync(fromPath, "utf8");
  fs.writeFileSync(toPath, rewriteImports(source), "utf8");

  const shim = `export * from "../services/product/${fileName}";\n`;
  fs.writeFileSync(path.join(UTILS_DIR, fileName), shim, "utf8");
}

console.log(`Migrated ${MOVED_FILES.length} product utils → services/product/`);
