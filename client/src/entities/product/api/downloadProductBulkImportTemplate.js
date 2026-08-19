import { apiClient } from "../../../shared/api/apiClient.js";

const TEMPLATE_FILENAME = "molha-product-import-template.xlsx";

export async function downloadProductBulkImportTemplate() {
  const response = await apiClient.get("/product/bulk-import/template", {
    responseType: "blob",
  });

  const blob = response.data;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = TEMPLATE_FILENAME;
  link.click();
  URL.revokeObjectURL(url);
}
