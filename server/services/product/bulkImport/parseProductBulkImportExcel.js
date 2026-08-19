import ExcelJS from "exceljs";

import {
  PRODUCT_BULK_IMPORT_COLUMNS,
  PRODUCT_BULK_IMPORT_SHEET_NAME,
} from "../../../constants/productBulkImportConstants.js";

/**
 * @param {string | undefined | null} raw
 */
const cellToString = (raw) => {
  if (raw == null) {
    return "";
  }
  if (typeof raw === "object" && raw !== null && "text" in raw) {
    return String(raw.text ?? "").trim();
  }
  if (raw instanceof Date) {
    return raw.toISOString();
  }
  return String(raw).trim();
};

/**
 * @param {Buffer} fileBuffer
 * @returns {Promise<Array<Record<string, string> & { __rowNumber: number }>>}
 */
export async function parseProductBulkImportExcel(fileBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const sheet =
    workbook.getWorksheet(PRODUCT_BULK_IMPORT_SHEET_NAME) ??
    workbook.worksheets[0];

  if (!sheet) {
    throw new Error("Лист с товарами не найден");
  }

  const headerRow = sheet.getRow(1);
  /** @type {string[]} */
  const headers = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber - 1] = cellToString(cell.value).toLowerCase();
  });

  const missingColumns = PRODUCT_BULK_IMPORT_COLUMNS.filter(
    (column) => !headers.includes(column),
  );
  if (missingColumns.length > 0) {
    throw new Error(
      `В шаблоне не хватает колонок: ${missingColumns.join(", ")}`,
    );
  }

  /** @type {Array<Record<string, string> & { __rowNumber: number }>} */
  const rows = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    /** @type {Record<string, string>} */
    const record = {};
    let hasAnyValue = false;

    headers.forEach((header, index) => {
      if (!header) {
        return;
      }
      const value = cellToString(row.getCell(index + 1).value);
      if (value !== "") {
        hasAnyValue = true;
      }
      record[header] = value;
    });

    if (hasAnyValue) {
      rows.push({ ...record, __rowNumber: rowNumber });
    }
  });

  return rows;
}
