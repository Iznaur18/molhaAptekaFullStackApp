/**
 * Маска: только цифры → 000-000 с автотире.
 * @param {string} raw
 */
export function maskPassportDepartmentCodeInput(raw) {
  const digits = String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);
  const left = digits.slice(0, 3);
  const right = digits.slice(3, 6);

  if (digits.length <= 3) return left;
  return `${left}-${right}`;
}
