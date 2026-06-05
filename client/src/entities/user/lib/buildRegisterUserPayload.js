import { appendRuAddressToPayload } from "../../address/lib/appendRuAddressToPayload.js";
import { normalizeRuPhoneInput } from "./ruPhone.js";
import {
  DEFAULT_USER_BACKGROUND_PRESET_ID,
  USER_GENDER_FEMALE,
  USER_GENDER_MALE,
  USER_GENDER_NO_SELECTED,
} from "../model/userConstants.js";
import { isUserBackgroundPresetId } from "../model/userBackgroundPresets.js";

/**
 * @param {{
 *   email: string;
 *   password: string;
 *   passwordConfirm: string;
 *   userName: string;
 *   phoneNumber: string;
 *   avatarUrl: string;
 *   backgroundPresetId: string;
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
    passwordConfirm: form.passwordConfirm,
  };

  const userName = String(form.userName).trim().toLowerCase();
  let phoneNumber = trimOrUndef(form.phoneNumber);
  if (phoneNumber) {
    phoneNumber = normalizeRuPhoneInput(phoneNumber);
  }
  const avatarUrl = trimOrUndef(form.avatarUrl);
  const presetId = String(form.backgroundPresetId ?? "").trim();
  const userBirthDate = trimOrUndef(form.userBirthDate);

  payload.userName = userName;
  if (phoneNumber) payload.phoneNumber = phoneNumber;
  if (avatarUrl) payload.avatarUrl = avatarUrl;
  if (isUserBackgroundPresetId(presetId)) {
    payload.backgroundPresetId = presetId;
  } else if (presetId === "") {
    payload.backgroundPresetId = DEFAULT_USER_BACKGROUND_PRESET_ID;
  }
  appendRuAddressToPayload(payload, form.deliveryAddress);
  if (userBirthDate) payload.userBirthDate = userBirthDate;

  const allowedGender = [USER_GENDER_MALE, USER_GENDER_FEMALE, USER_GENDER_NO_SELECTED];
  if (allowedGender.includes(form.userGender)) {
    payload.userGender = form.userGender;
  }

  payload.notificationsEnabled = Boolean(form.notificationsEnabled);

  return payload;
}
