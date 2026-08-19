import {
  productBulkImportSubmitDataSchema,
  productBulkImportValidationFailedDataSchema,
} from "@molha/api-contract";

import { apiClient } from "../../../shared/api/apiClient.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { postMultipart } from "@izibuy/shared-api";
import { formatApiErrorMessage } from "@izibuy/shared-lib";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {File} file
 * @returns {Promise<
 *   | { ok: true; jobId: string; totalRows: number }
 *   | { ok: false; message: string; errors: Array<{ row: number; field: string; message: string }> }
 * >}
 */
export async function submitProductBulkImport(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await postMultipart(apiClient, "/product/bulk-import", formData);
    const parsed = parseApiContractData(response, productBulkImportSubmitDataSchema);
    return {
      ok: true,
      jobId: parsed.jobId,
      totalRows: parsed.totalRows,
    };
  } catch (error) {
    const payload = error?.response?.data;
    if (payload?.data?.errors) {
      try {
        const failed = productBulkImportValidationFailedDataSchema.parse(payload.data);
        return {
          ok: false,
          message: failed.message,
          errors: failed.errors,
        };
      } catch {
        // fall through
      }
    }

    throw new Error(
      formatApiErrorMessage(error, CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_ERROR_GENERIC),
    );
  }
}
