import { readFile } from "node:fs/promises";

import { AppError } from "../../../errors/AppError.js";
import { UserModel } from "../../../models/index.js";
import ProductBulkImportJobModel from "../../../models/ProductBulkImportJobModel.js";
import { PRODUCT_BULK_IMPORT_MAX_FILE_BYTES } from "../../../constants/productBulkImportConstants.js";
import { assertSellerManualProductCreateAllowed } from "../../onec/assertSellerManualProductCreateAllowed.js";
import { parseProductBulkImportExcel } from "./parseProductBulkImportExcel.js";
import { resolveSellerDefaultPickupFromUser } from "./resolveSellerDefaultPickupFromUser.js";
import { validateProductBulkImportRows } from "./validateProductBulkImportRows.js";
import { enqueueProductBulkImport } from "./enqueueProductBulkImport.js";

/**
 * @param {{
 *   userId: string;
 *   file: Pick<Express.Multer.File, "path" | "buffer" | "size" | "mimetype" | "originalname">;
 * }} input
 */
export async function submitProductBulkImport({ userId, file }) {
  if (!file) {
    throw new AppError(400, "Файл не загружен");
  }

  if (Number(file.size) > PRODUCT_BULK_IMPORT_MAX_FILE_BYTES) {
    throw new AppError(400, "Файл не больше 5 МБ");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  await assertSellerManualProductCreateAllowed(String(userId));

  let sellerPickup;
  try {
    sellerPickup = resolveSellerDefaultPickupFromUser(user);
  } catch (error) {
    throw new AppError(
      400,
      error instanceof Error ? error.message : "Укажите адрес самовывоза в профиле",
    );
  }

  const fileBuffer = file.buffer
    ? file.buffer
    : await readFile(String(file.path));

  let parsedRows;
  try {
    parsedRows = await parseProductBulkImportExcel(fileBuffer);
  } catch (error) {
    throw new AppError(
      400,
      error instanceof Error ? error.message : "Не удалось прочитать Excel",
    );
  }

  const validation = await validateProductBulkImportRows({
    parsedRows,
    sellerId: String(userId),
    sellerPickup,
    user,
  });

  if (!validation.ok) {
    return {
      ok: false,
      message: "Исправьте ошибки в файле и загрузите снова",
      errors: validation.errors,
    };
  }

  const job = await ProductBulkImportJobModel.create({
    sellerId: userId,
    totalRows: validation.rows.length,
    processedRows: 0,
    rows: validation.rows,
    sellerPickup,
  });

  await enqueueProductBulkImport(String(job._id));

  return {
    ok: true,
    jobId: String(job._id),
    totalRows: validation.rows.length,
  };
}

/**
 * @param {{ userId: string; jobId: string }} input
 */
export async function getProductBulkImportJobStatus({ userId, jobId }) {
  const job = await ProductBulkImportJobModel.findById(jobId).lean();
  if (!job || String(job.sellerId) !== String(userId)) {
    throw new AppError(404, "Импорт не найден");
  }

  return {
    jobId: String(job._id),
    status: job.status,
    totalRows: job.totalRows,
    processedRows: job.processedRows,
    createdCount: Array.isArray(job.createdProductIds)
      ? job.createdProductIds.length
      : 0,
    errorMessage: job.errorMessage ?? "",
  };
}
