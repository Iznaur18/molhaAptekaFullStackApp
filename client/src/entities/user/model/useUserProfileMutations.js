import { useMutation } from "@tanstack/react-query";

import { deleteUserProfile } from "../api/deleteUserProfile.js";
import { patchUserProfile } from "../api/patchUserProfile.js";

export function useUserProfileMutations() {
  const patchMutation = useMutation({
    mutationFn: ({ userId, body }) => patchUserProfile(userId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => deleteUserProfile(userId),
  });

  return {
    patchMutation,
    deleteMutation,
  };
}
