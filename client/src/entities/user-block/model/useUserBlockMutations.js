import { useMutation } from "@tanstack/react-query";

import { blockUser } from "../api/blockUser.js";
import { unblockUser } from "../api/unblockUser.js";

/**
 * @param {{ onBlockedChange?: (patch: { isBlockedByMe: boolean }) => void }} [options]
 */
export function useUserBlockMutations(options = {}) {
  const blockMutation = useMutation({
    mutationFn: (targetUserId) => blockUser(targetUserId),
    onSuccess: (data) => {
      options.onBlockedChange?.({ isBlockedByMe: Boolean(data?.isBlockedByMe) });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (payload) => {
      if (typeof payload === "string") {
        return unblockUser(payload);
      }
      return unblockUser(payload.targetUserId, { asUserId: payload.asUserId });
    },
    onSuccess: (data) => {
      options.onBlockedChange?.({ isBlockedByMe: Boolean(data?.isBlockedByMe) });
    },
  });

  return { blockMutation, unblockMutation };
}
