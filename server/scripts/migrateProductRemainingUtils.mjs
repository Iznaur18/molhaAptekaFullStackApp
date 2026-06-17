import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UTILS_DIR = path.join(__dirname, "../utils");
const TARGET_DIR = path.join(__dirname, "../services/product");

const EXISTING_PRODUCT_FILES = fs
  .readdirSync(TARGET_DIR)
  .filter((name) => name.endsWith(".js") && name !== "index.js");

const REMAINING_PRODUCT_FILES = [
  "curatedProductListHelpers.js",
  "findCatalogProductById.js",
  "isProductViewableForProfile.js",
  "productReportHelpers.js",
  "productWishlistCount.js",
];

const MOVED_FILES = [...new Set([...EXISTING_PRODUCT_FILES, ...REMAINING_PRODUCT_FILES])];

const RAFFLE_IMPORTS = new Set(["raffleHelpers.js"]);

const rewriteImports = (source) => {
  let next = source
    .replaceAll('from "../constants/', 'from "../../constants/')
    .replaceAll('from "../models/', 'from "../../models/')
    .replaceAll('from "../errors/', 'from "../../errors/')
    .replaceAll('from "../db/', 'from "../../db/');

  next = next.replace(
    /from "\.\/([^"]+\.js)"/g,
    (_match, relPath) => {
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

for (const fileName of REMAINING_PRODUCT_FILES) {
  const fromPath = path.join(UTILS_DIR, fileName);
  const toPath = path.join(TARGET_DIR, fileName);
  const source = fs.readFileSync(fromPath, "utf8");
  fs.writeFileSync(toPath, rewriteImports(source), "utf8");

  const shim = `export * from "../services/product/${fileName}";\n`;
  fs.writeFileSync(path.join(UTILS_DIR, fileName), shim, "utf8");
}

console.log(`Migrated ${REMAINING_PRODUCT_FILES.length} product utils → services/product/`);
