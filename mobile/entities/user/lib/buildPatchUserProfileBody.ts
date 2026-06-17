import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { normalizeUploadUrlForStorage } from "@/shared/lib";

import { normalizeRuPhoneInput } from "./ruPhone";
import type { EditProfileFormState } from "./mapUserToEditProfileForm";

export const buildPatchUserProfileBody = (
  form: EditProfileFormState,
  initial: EditProfileFormState,
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};

  const rawName = form.userName.trim().toLowerCase();
  const initialName = initial.userName.trim().toLowerCase();
  if (rawName.length > 0 && rawName !== initialName) {
    body.userName = rawName;
  }

  const phoneRaw = form.userPhoneNumber.trim();
  const initialPhone = initial.userPhoneNumber.trim();
  if (phoneRaw !== "") {
    body.userPhoneNumber = normalizeRuPhoneInput(phoneRaw);
  } else if (initialPhone !== "") {
    body.userPhoneNumber = null;
  }

  if (form.notificationsEnabled !== initial.notificationsEnabled) {
    body.notificationsEnabled = form.notificationsEnabled;
  }

  const avatarUrl = normalizeUploadUrlForStorage(form.userAvatarUrl);
  const initialAvatarUrl = normalizeUploadUrlForStorage(initial.userAvatarUrl);
  if (avatarUrl !== initialAvatarUrl) {
    body.userAvatarUrl = avatarUrl === "" ? DEFAULT_USER_AVATAR_URL : avatarUrl;
  }

  return body;
};
