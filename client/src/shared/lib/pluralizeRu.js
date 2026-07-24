/**
 * Русская плюрализация: forms = [один, два-четыре, много].
 *
 * @param {number} count
 * @param {readonly [string, string, string]} forms
 */
export function pluralizeRu(count, forms) {
  const n = Math.abs(Math.trunc(Number(count)));
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0];
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return forms[1];
  }
  return forms[2];
}
