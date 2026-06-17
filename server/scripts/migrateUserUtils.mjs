import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UTILS_DIR = path.join(__dirname, "../utils");
const TARGET_DIR = path.join(__dirname, "../services/user");
const PRODUCT_DIR = path.join(__dirname, "../services/product");

const EXISTING_USER_FILES = fs.existsSync(TARGET_DIR)
  ? fs.readdirSync(TARGET_DIR).filter((name) => name.endsWith(".js") && name !== "index.js")
  : [];

const PRODUCT_FILES = fs.readdirSync(PRODUCT_DIR).filter(
  (name) => name.endsWith(".js") && name !== "index.js",
);

const USER_DOMAIN_FILES = [
  "attachUserListCommerceStats.js",
  "buildUserProfileMongoUpdate.js",
  "deleteUserCascade.js",
  "expoPushNotifications.js",
  "maskPassportForApi.js",
  "optionalViewerFromRequest.js",
  "premiumAccess.js",
  "userBackgroundValue.js",
  "userCityCatalogFilter.js",
  "userDataConfirmationHelpers.js",
  "userFollowHelpers.js",
  "userInAppNotifications.js",
  "userProfileVisibility.js",
  "userPurchasedProduct.js",
  "userPurchasesVisibility.js",
  "userRecentPurchases.js",
  "userSellerCatalogProducts.js",
  "userStoryHelpers.js",
  "validatePassportPayload.js",
];

const MOVED_USER_FILES = [...new Set([...EXISTING_USER_FILES, ...USER_DOMAIN_FILES])];
const PRODUCT_IMPORTS = new Set(PRODUCT_FILES);
const RAFFLE_IMPORTS = new Set(["raffleHelpers.js"]);

const rewriteImports = (source) => {
  let next = source
    .replaceAll('from "../constants/', 'from "../../constants/')
    .replaceAll('from "../models/', 'from "../../models/')
    .replaceAll('from "../errors/', 'from "../../errors/')
    .replaceAll('from "../db/', 'from "../../db/')
    .replaceAll('from "../controllers/', 'from "../../controllers/');

  next = next.replace(
    /from "\.\/([^"]+\.js)"/g,
    (_match, relPath) => {
      if (MOVED_USER_FILES.includes(relPath)) {
        return `from "./${relPath}"`;
      }
      if (PRODUCT_IMPORTS.has(relPath)) {
        return `from "../product/${relPath}"`;
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

for (const fileName of USER_DOMAIN_FILES) {
  const fromPath = path.join(UTILS_DIR, fileName);
  const toPath = path.join(TARGET_DIR, fileName);
  const source = fs.readFileSync(fromPath, "utf8");
  fs.writeFileSync(toPath, rewriteImports(source), "utf8");

  const shim = `export * from "../services/user/${fileName}";\n`;
  fs.writeFileSync(path.join(UTILS_DIR, fileName), shim, "utf8");
}

console.log(`Migrated ${USER_DOMAIN_FILES.length} user utils → services/user/`);
