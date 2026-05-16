/**
 * @typedef {{ id: string; url: string }} ProductImageRow
 */

/**
 * @returns {ProductImageRow}
 */
export function createImageRow(url = "") {
  return {
    id: crypto.randomUUID(),
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
  return rows.map((row) => String(row.url).trim()).filter(Boolean);
}
