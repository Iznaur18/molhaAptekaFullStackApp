import type { RegisterPayload } from "../api/registerUser";
import { readPersistedReferralCode } from "@/shared/lib/referralCodeStorage";

const DEFAULT_BACKGROUND_PRESET_ID = "mist";
const DEFAULT_USER_GENDER = "noSelected";

export type RegisterFormValues = {
  email: string;
  password: string;
  passwordConfirm: string;
  userName: string;
};

export const buildRegisterPayload = async (
  form: RegisterFormValues,
): Promise<RegisterPayload> => {
  const referralCode = await readPersistedReferralCode();
  return {
    email: form.email.trim(),
    password: form.password,
    passwordConfirm: form.passwordConfirm,
    userName: form.userName.trim().toLowerCase(),
    backgroundPresetId: DEFAULT_BACKGROUND_PRESET_ID,
    userGender: DEFAULT_USER_GENDER,
    notificationsEnabled: true,
    ...(referralCode ? { referralCode } : {}),
  };
};
