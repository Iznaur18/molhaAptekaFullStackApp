import type { RegisterPayload } from "../api/registerUser";

const DEFAULT_BACKGROUND_PRESET_ID = "mist";
const DEFAULT_USER_GENDER = "noSelected";

export type RegisterFormValues = {
  email: string;
  password: string;
  passwordConfirm: string;
  userName: string;
};

export const buildRegisterPayload = (form: RegisterFormValues): RegisterPayload => ({
  email: form.email.trim(),
  password: form.password,
  passwordConfirm: form.passwordConfirm,
  userName: form.userName.trim().toLowerCase(),
  backgroundPresetId: DEFAULT_BACKGROUND_PRESET_ID,
  userGender: DEFAULT_USER_GENDER,
  notificationsEnabled: true,
});
