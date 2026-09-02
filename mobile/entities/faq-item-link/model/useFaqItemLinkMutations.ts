import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchFaqItemLink } from "../api/patchFaqItemLink";
import { faqItemLinkQueryKeys } from "./useFaqItemLinksQuery";

export const useFaqItemLinkMutations = () => {
  const queryClient = useQueryClient();

  const patchLinkMutation = useMutation({
    mutationFn: ({
      itemId,
      body,
    }: {
      itemId: string;
      body: { href?: string | null; resetHref?: boolean };
    }) => patchFaqItemLink(itemId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqItemLinkQueryKeys.all });
    },
  });

  return { patchLinkMutation };
};
