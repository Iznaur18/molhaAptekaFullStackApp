import multer from "multer";

import { PRODUCT_BULK_IMPORT_MAX_FILE_BYTES } from "../constants/productBulkImportConstants.js";

const EXCEL_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/octet-stream",
]);

const excelFileFilter = (_req, file, cb) => {
  const name = String(file.originalname ?? "").toLowerCase();
  if (name.endsWith(".xlsx") || EXCEL_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(null, false);
};

export const uploadExcelMW = multer({
  storage: multer.memoryStorage(),
  fileFilter: excelFileFilter,
  limits: { fileSize: PRODUCT_BULK_IMPORT_MAX_FILE_BYTES },
});
