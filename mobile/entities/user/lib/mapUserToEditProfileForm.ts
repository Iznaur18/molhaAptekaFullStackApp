import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";

export type EditProfileFormState = {
  userName: string;
  userPhoneNumber: string;
  userAvatarUrl: string;
  notificationsEnabled: boolean;
};

export const mapUserToEditProfileForm = (
  user: Record<string, unknown>,
): EditProfileFormState => ({
  userName: typeof user.userName === "string" ? user.userName : "",
  userPhoneNumber: typeof user.userPhoneNumber === "string" ? user.userPhoneNumber : "",
  userAvatarUrl:
    typeof user.userAvatarUrl === "string" && user.userAvatarUrl.trim()
      ? user.userAvatarUrl
      : DEFAULT_USER_AVATAR_URL,
  notificationsEnabled: user.notificationsEnabled !== false,
});
