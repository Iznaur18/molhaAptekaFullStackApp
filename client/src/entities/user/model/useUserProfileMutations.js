import { useMutation } from "@tanstack/react-query";

import { deleteUserProfile } from "../api/deleteUserProfile.js";
import { patchSellerProductModerationTrust } from "../api/patchSellerProductModerationTrust.js";
import { patchUserProfile } from "../api/patchUserProfile.js";

export function useUserProfileMutations() {
  const patchMutation = useMutation({
    mutationFn: ({ userId, body }) => patchUserProfile(userId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => deleteUserProfile(userId),
  });

  // Доверие модерации живёт на своём staff-эндпоинте, а не в теле профиля:
  // решение об отказе от проверки должно попадать в журнал staff-действий.
  const productModerationTrustMutation = useMutation({
    mutationFn: ({ userId, trusted }) =>
      patchSellerProductModerationTrust({ userId, trusted }),
  });

  return {
    patchMutation,
    deleteMutation,
    productModerationTrustMutation,
  };
}
