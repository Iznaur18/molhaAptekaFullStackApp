import { userSavedAddressesFromProfile } from "@molha/api-contract";

export type UserSavedAddressReadOnly = ReturnType<typeof userSavedAddressesFromProfile>[number];

export const userSavedAddressesFromUser = (
  user: Record<string, unknown>,
): UserSavedAddressReadOnly[] => userSavedAddressesFromProfile(user);
