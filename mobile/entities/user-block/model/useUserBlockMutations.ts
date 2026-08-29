import { useMutation } from "@tanstack/react-query";

import { blockUser } from "@/entities/user-block/api/blockUser";
import { unblockUser } from "@/entities/user-block/api/unblockUser";

type UseUserBlockMutationsOptions = {
  onBlockedChange?: (patch: { isBlockedByMe: boolean }) => void;
};

export const useUserBlockMutations = (options: UseUserBlockMutationsOptions = {}) => {
  const blockMutation = useMutation({
    mutationFn: (targetUserId: string) => blockUser(targetUserId),
    onSuccess: (data) => {
      options.onBlockedChange?.({ isBlockedByMe: Boolean(data?.isBlockedByMe) });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (payload: string | { targetUserId: string; asUserId?: string }) => {
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
};
