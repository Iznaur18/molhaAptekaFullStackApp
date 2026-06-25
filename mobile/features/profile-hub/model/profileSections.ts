import type { ProfileSectionId } from "@izibuy/shared-lib";
import {
  PROFILE_SECTION_ADMIN_ORDERS,
  PROFILE_SECTION_APP_INTRO_ADMIN,
  PROFILE_SECTION_EDIT_PROFILE,
  PROFILE_SECTION_IDS,
  PROFILE_SECTION_MY_ORDERS,
  PROFILE_SECTION_OVERVIEW,
  isProfileSectionId,
  isProfileStaffWebOnlySection,
} from "@izibuy/shared-lib";
export {
  PROFILE_SECTION_ADMIN_ORDERS,
  PROFILE_SECTION_APP_INTRO_ADMIN,
  PROFILE_SECTION_EDIT_PROFILE,
  PROFILE_SECTION_IDS,
  PROFILE_SECTION_MY_ORDERS,
  PROFILE_SECTION_OVERVIEW,
  isProfileSectionId,
  isProfileStaffWebOnlySection,
};
export type { ProfileSectionId } from "@izibuy/shared-lib";

/** Разделы, которые ведут на существующие stack-экраны вне /hub. */
export const PROFILE_SECTION_EXTERNAL_ROUTES: Partial<
  Record<ProfileSectionId, string>
> = {
  [PROFILE_SECTION_EDIT_PROFILE]: "/profile/edit",
};

export const resolveProfileSectionRoute = (sectionId: ProfileSectionId): string | null =>
  PROFILE_SECTION_EXTERNAL_ROUTES[sectionId] ?? `/hub/${sectionId}`;
