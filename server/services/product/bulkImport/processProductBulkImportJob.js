import {
  PRODUCT_BULK_IMPORT_JOB_STATUS_COMPLETED,
  PRODUCT_BULK_IMPORT_JOB_STATUS_FAILED,
  PRODUCT_BULK_IMPORT_JOB_STATUS_PROCESSING,
} from "../../../constants/productBulkImportConstants.js";
import ProductBulkImportJobModel from "../../../models/ProductBulkImportJobModel.js";
import { formatLogError, logServerEvent } from "../../../utils/logServerEvent.js";
import { postProduct } from "../postProduct.js";
import { importRemoteProductImage } from "./importRemoteProductImage.js";

/**
 * @param {string} jobId
 */
export async function processProductBulkImportJob(jobId) {
  const job = await ProductBulkImportJobModel.findById(jobId);
  if (!job) {
    throw new Error("Import job not found");
  }

  if (
    job.status === PRODUCT_BULK_IMPORT_JOB_STATUS_COMPLETED ||
    job.status === PRODUCT_BULK_IMPORT_JOB_STATUS_FAILED
  ) {
    return;
  }

  job.status = PRODUCT_BULK_IMPORT_JOB_STATUS_PROCESSING;
  job.processedRows = 0;
  job.createdProductIds = [];
  job.errorMessage = "";
  await job.save();

  /** @type {import('./validateProductBulkImportRows.js').BulkImportValidatedRow[]} */
  const rows = Array.isArray(job.rows) ? job.rows : [];

  try {
    for (const row of rows) {
      /** @type {string[]} */
      const storedImageUrls = [];
      for (const imageUrl of row.imageUrls) {
        storedImageUrls.push(await importRemoteProductImage(imageUrl));
      }

      const result = await postProduct({
        userId: String(job.sellerId),
        body: {
          ...row.body,
          productImageUrls: storedImageUrls,
        },
        productArticle: row.productArticle || undefined,
        skipSellerLimitCheck: true,
      });

      const productId = result.product?._id;
      if (productId) {
        job.createdProductIds.push(productId);
      }

      job.processedRows += 1;
      await job.save();
    }

    job.status = PRODUCT_BULK_IMPORT_JOB_STATUS_COMPLETED;
    await job.save();
  } catch (error) {
    job.status = PRODUCT_BULK_IMPORT_JOB_STATUS_FAILED;
    job.errorMessage = (
      error instanceof Error ? error.message : String(error)
    ).slice(0, 2000);
    await job.save();

    logServerEvent("error", {
      event: "product_bulk_import_job_failed",
      jobId: String(job._id),
      processedRows: job.processedRows,
      ...formatLogError(error),
    });

    throw error;
  }
}
