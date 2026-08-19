import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Usage: node scripts/inspectProductBulkImportFile.mjs <file.xlsx>");
  process.exit(1);
}

const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { parseProductBulkImportExcel } = await import(
  "../services/product/bulkImport/parseProductBulkImportExcel.js"
);

const filePath = path.resolve(fileArg);
const buffer = await readFile(filePath);
const rows = await parseProductBulkImportExcel(buffer);

console.log(JSON.stringify({ filePath, rowCount: rows.length, rows }, null, 2));
