/**
 * @typedef {{ id: string; url: string }} ProductImageRow
 */

/** @returns {string} */
function createRowId() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * @returns {ProductImageRow}
 */
export function createImageRow(url = "") {
  return {
    id: createRowId(),
    url,
  };
}

/**
 * @param {string[]} urls
 * @returns {ProductImageRow[]}
 */
export function imageRowsFromUrls(urls) {
  if (!urls.length) return [createImageRow("")];
  return urls.map((url) => createImageRow(url));
}

/**
 * @param {ProductImageRow[]} rows
 * @returns {string[]}
 */
export function urlsFromImageRows(rows) {
  return rows
    .map((row) => String(row.url).trim())
    .filter(Boolean);
}
