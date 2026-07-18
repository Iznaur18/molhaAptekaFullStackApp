export type RegisterPayload = {
  email: string;
  password: string;
  passwordConfirm: string;
  userName: string;
  backgroundPresetId?: string;
  userGender?: string;
  notificationsEnabled?: boolean;
};
