import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchFaqItemLink } from "../api/patchFaqItemLink.js";
import { faqItemLinkQueryKeys } from "./faqItemLinkQueryKeys.js";

export function useFaqItemLinkMutations() {
  const queryClient = useQueryClient();

  const patchLinkMutation = useMutation({
    mutationFn: /** @param {{ itemId: string; body: { href?: string | null; resetHref?: boolean } }} vars */ ({
      itemId,
      body,
    }) => patchFaqItemLink(itemId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqItemLinkQueryKeys.all });
    },
  });

  return { patchLinkMutation };
}
