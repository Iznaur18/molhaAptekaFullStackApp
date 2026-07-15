import { isPassportDateInputComplete } from "./passportDateInputMask.js";

/**
 * @param {import('../model/types.js').PassportSnapshot} form
 * @returns {string | null}
 */
export function validatePassportForm(form) {
  if (!form.lastName.trim()) return "Укажите фамилию";
  if (!form.firstName.trim()) return "Укажите имя";
  if (!isPassportDateInputComplete(form.birthDate)) return "Дата рождения: ДД.ММ.ГГГГ";
  if (!/^\d{4}$/.test(form.series.trim())) return "Серия: 4 цифры";
  if (!/^\d{6}$/.test(form.number.trim())) return "Номер: 6 цифр";
  if (!/^\d{3}-\d{3}$/.test(form.departmentCode.trim())) {
    return "Код подразделения: 000-000";
  }
  if (!form.issuedBy.trim()) return "Укажите, кем выдан паспорт";
  if (!isPassportDateInputComplete(form.issuedAt)) return "Дата выдачи: ДД.ММ.ГГГГ";
  return null;
}
