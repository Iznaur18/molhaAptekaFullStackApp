import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mongoose from "mongoose";

const skipImages = process.argv.includes("--skip-images");
const fileArg = process.argv.find((arg) => !arg.startsWith("-") && arg.endsWith(".xlsx"));

if (!fileArg) {
  console.error("Usage: node scripts/validateProductBulkImportFile.mjs <file.xlsx> [--skip-images]");
  process.exit(1);
}

const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(serverRoot);

const dotenv = await import("dotenv");
dotenv.config({ path: path.join(serverRoot, ".env") });

const { connectMongo } = await import("../utils/connectMongo.js");
const { parseProductBulkImportExcel } = await import(
  "../services/product/bulkImport/parseProductBulkImportExcel.js"
);
const { validateProductBulkImportRows } = await import(
  "../services/product/bulkImport/validateProductBulkImportRows.js"
);
const { resolveSellerDefaultPickupFromUser } = await import(
  "../services/product/bulkImport/resolveSellerDefaultPickupFromUser.js"
);
const { UserModel } = await import("../models/index.js");

const filePath = path.resolve(fileArg);
const buffer = await readFile(filePath);

console.log(`File: ${filePath}`);
console.log(`Size: ${buffer.length} bytes`);
console.log(`Image precheck: ${skipImages ? "skipped" : "enabled (slow)"}`);

await connectMongo();

const parsedRows = await parseProductBulkImportExcel(buffer);
console.log(`Rows: ${parsedRows.length}`);
console.log("---");

const sellerId = process.env.BULK_IMPORT_VALIDATE_SELLER_ID?.trim();
if (!sellerId) {
  console.log("Set BULK_IMPORT_VALIDATE_SELLER_ID in .env to validate categories/articles against DB.");
  for (const row of parsedRows) {
    console.log(`Row ${row.__rowNumber}:`, JSON.stringify(row, null, 0));
  }
  await mongoose.disconnect();
  process.exit(0);
}

const user = await UserModel.findById(sellerId).lean();
if (!user) {
  console.error("Seller not found:", sellerId);
  process.exit(1);
}

let sellerPickup;
try {
  sellerPickup = resolveSellerDefaultPickupFromUser(user);
} catch (error) {
  console.error("Pickup profile error:", error instanceof Error ? error.message : error);
  process.exit(1);
}

if (skipImages) {
  const original = await import(
    "../services/product/bulkImport/prevalidateBulkImportImageUrl.js"
  );
  original.prevalidateBulkImportImageUrl = async (url) => url;
}

const started = Date.now();
const result = await validateProductBulkImportRows({
  parsedRows,
  sellerId,
  sellerPickup,
  user,
});
console.log(`Validation took ${((Date.now() - started) / 1000).toFixed(1)}s`);

if (!result.ok) {
  console.log("FAILED");
  for (const err of result.errors) {
    console.log(`  row ${err.row}, ${err.field}: ${err.message}`);
  }
  await mongoose.disconnect();
  process.exit(2);
}

console.log("OK", result.rows.length, "rows");
await mongoose.disconnect();
