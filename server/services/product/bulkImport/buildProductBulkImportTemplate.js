import ExcelJS from "exceljs";

import {
  PRODUCT_BULK_IMPORT_COLUMNS,
  PRODUCT_BULK_IMPORT_CATEGORIES_SHEET_NAME,
  PRODUCT_BULK_IMPORT_SHEET_NAME,
} from "../../../constants/productBulkImportConstants.js";
import ProductCategoryModel from "../../../models/ProductCategoryModel.js";
import { buildLeafCategoryBreadcrumbPath } from "./buildLeafCategoryBreadcrumbPath.js";

const EXAMPLE_ROW_DEFAULT = {
  название: "Парацетамол 500 мг",
  описание: "Обезболивающее и жаропонижающее средство, упаковка 20 таблеток.",
  цена: 199,
  остаток: 10,
  тип_происхождения: "own",
  фото_url: "https://example.com/photo.jpg",
  категория: "",
  артикул: "PAR-500",
  самовывоз: "да",
  доставка: "нет",
  старая_цена: "",
};

/**
 * @returns {Promise<Buffer>}
 */
export async function buildProductBulkImportTemplateBuffer() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Molha";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(PRODUCT_BULK_IMPORT_SHEET_NAME);
  sheet.addRow(PRODUCT_BULK_IMPORT_COLUMNS);
  const leaves = await ProductCategoryModel.find({ isLeaf: true })
    .select("pathLabelRu labelRu")
    .sort({ pathLabelRu: 1, labelRu: 1 })
    .lean();

  const exampleRow = { ...EXAMPLE_ROW_DEFAULT };
  if (leaves[0]) {
    exampleRow.категория = buildLeafCategoryBreadcrumbPath(leaves[0]);
  }

  sheet.addRow(
    PRODUCT_BULK_IMPORT_COLUMNS.map((column) => exampleRow[column] ?? ""),
  );

  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  PRODUCT_BULK_IMPORT_COLUMNS.forEach((_, index) => {
    sheet.getColumn(index + 1).width = 22;
  });

  const categoriesSheet = workbook.addWorksheet(
    PRODUCT_BULK_IMPORT_CATEGORIES_SHEET_NAME,
  );
  categoriesSheet.addRow(["путь", "id"]);
  categoriesSheet.getRow(1).font = { bold: true };

  for (const leaf of leaves) {
    const path = buildLeafCategoryBreadcrumbPath(leaf);
    categoriesSheet.addRow([path, String(leaf._id)]);
  }

  categoriesSheet.getColumn(1).width = 48;
  categoriesSheet.getColumn(2).width = 28;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
