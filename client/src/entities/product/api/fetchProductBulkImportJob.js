import { productBulkImportJobStatusDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/apiClient.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} jobId
 */
export async function fetchProductBulkImportJob(jobId) {
  try {
    const { data } = await apiClient.get(`/product/bulk-import/${jobId}`);
    return parseApiContractData(data, productBulkImportJobStatusDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_ERROR_GENERIC),
    );
  }
}
