export type PassportSnapshot = {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  series: string;
  number: string;
  issuedBy: string;
  issuedAt: string;
  departmentCode: string;
};

export const emptyPassportForm = (): PassportSnapshot => ({
  lastName: "",
  firstName: "",
  middleName: "",
  birthDate: "",
  series: "",
  number: "",
  issuedBy: "",
  issuedAt: "",
  departmentCode: "",
});
