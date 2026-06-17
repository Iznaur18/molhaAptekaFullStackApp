import {
  isProfileStaffWebOnlySection,
  resolveProfileStaffWebPath,
  type ProfileSectionId,
} from "@izibuy/shared-lib";
import { Linking } from "react-native";

import { WEB_APP_BASE_URL } from "@/shared/config/webAppBaseUrl";

const trimTrailingSlash = (url: string): string => url.replace(/\/$/, "");

export const buildProfileStaffWebUrl = (sectionId: ProfileSectionId): string | null => {
  if (!isProfileStaffWebOnlySection(sectionId)) {
    return null;
  }

  const base = trimTrailingSlash(WEB_APP_BASE_URL);
  const path = resolveProfileStaffWebPath(sectionId);
  return `${base}${path}`;
};

export const openProfileStaffWebSection = async (
  sectionId: ProfileSectionId,
): Promise<boolean> => {
  const url = buildProfileStaffWebUrl(sectionId);
  if (!url) {
    return false;
  }

  await Linking.openURL(url);
  return true;
};
