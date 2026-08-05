import type { RegisterPayload } from "../api/registerUser";
import type { RegisterPhonePayload } from "../api/phoneAuth";
import { readPersistedReferralCode } from "@/shared/lib/referralCodeStorage";

const DEFAULT_BACKGROUND_PRESET_ID = "mist";
const DEFAULT_USER_GENDER = "noSelected";

export type RegisterFormValues = {
  email: string;
  password: string;
  passwordConfirm: string;
  userName: string;
};

export type RegisterPhoneFormValues = {
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
  userName: string;
};

const buildRegisterBasePayload = async (
  form: Pick<RegisterFormValues, "password" | "passwordConfirm" | "userName">,
) => {
  const referralCode = await readPersistedReferralCode();
  return {
    password: form.password,
    passwordConfirm: form.passwordConfirm,
    userName: form.userName.trim().toLowerCase(),
    backgroundPresetId: DEFAULT_BACKGROUND_PRESET_ID,
    userGender: DEFAULT_USER_GENDER,
    notificationsEnabled: true,
    ...(referralCode ? { referralCode } : {}),
  };
};

export const buildRegisterPayload = async (
  form: RegisterFormValues,
): Promise<RegisterPayload> => {
  const base = await buildRegisterBasePayload(form);
  return {
    ...base,
    email: form.email.trim(),
  };
};

export const buildRegisterPhonePayload = async (
  form: RegisterPhoneFormValues,
): Promise<RegisterPhonePayload> => {
  const base = await buildRegisterBasePayload(form);
  return {
    ...base,
    phoneNumber: form.phoneNumber.trim(),
  };
};
