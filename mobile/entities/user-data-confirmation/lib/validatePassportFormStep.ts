import type { PassportSnapshot } from "./emptyPassportForm";
import { isPassportDateInputComplete } from "./passportDateInputMask";

export const PASSPORT_FORM_STEP_IDENTITY = 0;
export const PASSPORT_FORM_STEP_PASSPORT = 1;
export const PASSPORT_FORM_STEP_SELFIE = 2;

export const PASSPORT_FORM_STEP_COUNT = 3;

/** Частичная валидация шага мастера подтверждения данных. */
export const validatePassportFormStep = (
  form: PassportSnapshot,
  step: number,
): string | null => {
  if (step === PASSPORT_FORM_STEP_IDENTITY) {
    if (!form.lastName.trim()) {
      return "Укажите фамилию";
    }
    if (!form.firstName.trim()) {
      return "Укажите имя";
    }
    if (!isPassportDateInputComplete(form.birthDate)) {
      return "Дата рождения: ДД.ММ.ГГГГ";
    }
    return null;
  }

  if (step === PASSPORT_FORM_STEP_PASSPORT) {
    if (!/^\d{4}$/.test(form.series.trim())) {
      return "Серия: 4 цифры";
    }
    if (!/^\d{6}$/.test(form.number.trim())) {
      return "Номер: 6 цифр";
    }
    if (!form.issuedBy.trim()) {
      return "Укажите, кем выдан паспорт";
    }
    if (!isPassportDateInputComplete(form.issuedAt)) {
      return "Дата выдачи: ДД.ММ.ГГГГ";
    }
    if (!/^\d{3}-\d{3}$/.test(form.departmentCode.trim())) {
      return "Код подразделения: 000-000";
    }
    return null;
  }

  return null;
};
