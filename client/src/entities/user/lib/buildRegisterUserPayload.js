import {
  DEFAULT_USER_BACKGROUND_PRESET_ID,
  USER_GENDER_NO_SELECTED,
} from "../model/userConstants.js";
import { readPersistedReferralCode } from "../../../shared/lib/referralCodeStorage.js";

/**
 * @param {{
 *   email?: string;
 *   phoneNumber?: string;
 *   password: string;
 *   passwordConfirm: string;
 *   userName: string;
 * }} form
 * @param {"email" | "phone"} [channel]
 */
export function buildRegisterUserPayload(form, channel = "email") {
  const referralCode = readPersistedReferralCode();
  const base = {
    password: form.password,
    passwordConfirm: form.passwordConfirm,
    userName: String(form.userName).trim().toLowerCase(),
    backgroundPresetId: DEFAULT_USER_BACKGROUND_PRESET_ID,
    userGender: USER_GENDER_NO_SELECTED,
    notificationsEnabled: true,
    ...(referralCode ? { referralCode } : {}),
  };
  if (channel === "phone") {
    return {
      ...base,
      phoneNumber: String(form.phoneNumber ?? "").trim(),
    };
  }
  return {
    ...base,
    email: String(form.email ?? "").trim(),
  };
}
