/**
 * @returns {import('../model/types.js').PassportSnapshot}
 */
export function emptyPassportForm() {
  return {
    lastName: "",
    firstName: "",
    middleName: "",
    birthDate: "",
    series: "",
    number: "",
    issuedBy: "",
    issuedAt: "",
    departmentCode: "",
  };
}
