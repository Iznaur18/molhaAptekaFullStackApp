import { appendRuAddressToPayload } from "../../address/lib/appendRuAddressToPayload.js";
import { normalizeRuPhoneInput } from "./ruPhone.js";
import {
  USER_GENDER_FEMALE,
  USER_GENDER_MALE,
  USER_GENDER_NO_SELECTED,
} from "../model/userConstants.js";

/**
 * @param {{
 *   email: string;
 *   password: string;
 *   userName: string;
 *   phoneNumber: string;
 *   avatarUrl: string;
 *   backgroundUrl: string;
 *   userBirthDate: string;
 *   userGender: string;
 *   deliveryAddress: import('../../address/model/types.js').RuDeliveryAddressValue;
 *   notificationsEnabled: boolean;
 * }} form
 * @returns {import('../model/types.js').RegisterUserPayload}
 */
export function buildRegisterUserPayload(form) {
  const trimOrUndef = (value) => {
    if (value == null || String(value).trim() === "") return undefined;
    return String(value).trim();
  };

  const payload = {
    email: form.email.trim(),
    password: form.password,
  };

  const userName = String(form.userName).trim().toLowerCase();
  let phoneNumber = trimOrUndef(form.phoneNumber);
  if (phoneNumber) {
    phoneNumber = normalizeRuPhoneInput(phoneNumber);
  }
  const avatarUrl = trimOrUndef(form.avatarUrl);
  const backgroundUrl = trimOrUndef(form.backgroundUrl);
  const userBirthDate = trimOrUndef(form.userBirthDate);

  payload.userName = userName;
  if (phoneNumber) payload.phoneNumber = phoneNumber;
  if (avatarUrl) payload.avatarUrl = avatarUrl;
  if (backgroundUrl) payload.backgroundUrl = backgroundUrl;
  appendRuAddressToPayload(payload, form.deliveryAddress);
  if (userBirthDate) payload.userBirthDate = userBirthDate;

  const allowedGender = [
    USER_GENDER_MALE,
    USER_GENDER_FEMALE,
    USER_GENDER_NO_SELECTED,
  ];
  if (allowedGender.includes(form.userGender)) {
    payload.userGender = form.userGender;
  }

  payload.notificationsEnabled = Boolean(form.notificationsEnabled);

  return payload;
}
