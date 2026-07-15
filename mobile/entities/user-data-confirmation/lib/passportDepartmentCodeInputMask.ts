/** Маска: только цифры → 000-000 с автотире. */
export const maskPassportDepartmentCodeInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  const left = digits.slice(0, 3);
  const right = digits.slice(3, 6);

  if (digits.length <= 3) {
    return left;
  }
  return `${left}-${right}`;
};
