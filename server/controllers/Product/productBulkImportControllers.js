import { PRODUCT_BULK_IMPORT_TEMPLATE_FILENAME } from "../../constants/productBulkImportConstants.js";
import { buildProductBulkImportTemplateBuffer } from "../../services/product/bulkImport/buildProductBulkImportTemplate.js";
import {
  getProductBulkImportJobStatus,
  submitProductBulkImport,
} from "../../services/product/bulkImport/submitProductBulkImport.js";
import { successRes } from "../../services/http/index.js";

export async function downloadProductBulkImportTemplateController(_req, res) {
  const buffer = await buildProductBulkImportTemplateBuffer();
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${PRODUCT_BULK_IMPORT_TEMPLATE_FILENAME}"`,
  );
  return res.status(200).send(buffer);
}

export async function submitProductBulkImportController(req, res) {
  const result = await submitProductBulkImport({
    userId: req.userId,
    file: req.file,
  });

  if (!result.ok) {
    return res.status(400).json({
      success: false,
      message: result.message,
      data: {
        message: result.message,
        errors: result.errors,
      },
    });
  }

  return successRes(
    res,
    {
      jobId: result.jobId,
      totalRows: result.totalRows,
    },
    202,
  );
}

export async function getProductBulkImportJobStatusController(req, res) {
  const status = await getProductBulkImportJobStatus({
    userId: req.userId,
    jobId: req.params.jobId,
  });

  return successRes(res, status);
}
