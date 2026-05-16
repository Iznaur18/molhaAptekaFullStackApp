/**
 * @param {string | undefined} userAddress
 * @param {string | undefined} userAddressFlat
 * @returns {{ line: string; flat: string }}
 */
export function splitAddressForForm(userAddress, userAddressFlat) {
  const flat = String(userAddressFlat ?? "").trim();
  let line = String(userAddress ?? "").trim();

  if (flat && line) {
    const suffixes = [`, кв ${flat}`, `, кв. ${flat}`, `, квартира ${flat}`];
    for (const suffix of suffixes) {
      if (line.endsWith(suffix)) {
        line = line.slice(0, -suffix.length).trim();
        break;
      }
    }
  }

  return { line, flat };
}
