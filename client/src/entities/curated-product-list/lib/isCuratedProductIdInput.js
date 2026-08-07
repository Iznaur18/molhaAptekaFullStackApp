/** @param {string | null | undefined} raw */
export function isCuratedProductIdInput(raw) {
  return /^[a-f\d]{24}$/i.test(String(raw ?? "").trim());
}
