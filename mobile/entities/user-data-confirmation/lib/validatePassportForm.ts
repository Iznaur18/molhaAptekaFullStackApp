import type { PassportSnapshot } from "./emptyPassportForm";

export const validatePassportForm = (form: PassportSnapshot): string | null => {
  if (!form.lastName.trim()) {
    return "Укажите фамилию";
  }
  if (!form.firstName.trim()) {
    return "Укажите имя";
  }
  if (!/^\d{4}$/.test(form.series.trim())) {
    return "Серия: 4 цифры";
  }
  if (!/^\d{6}$/.test(form.number.trim())) {
    return "Номер: 6 цифр";
  }
  if (!/^\d{3}-\d{3}$/.test(form.departmentCode.trim())) {
    return "Код подразделения: 000-000";
  }
  if (!form.issuedBy.trim()) {
    return "Укажите, кем выдан паспорт";
  }
  if (!form.birthDate) {
    return "Укажите дату рождения";
  }
  if (!form.issuedAt) {
    return "Укажите дату выдачи";
  }
  return null;
};
