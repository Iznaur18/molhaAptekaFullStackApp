import { useQuery } from "@tanstack/react-query";

import { fetchFaqItemLinks } from "../api/fetchFaqItemLinks";

export const faqItemLinkQueryKeys = {
  all: ["faq-item-link"] as const,
};

export const useFaqItemLinksQuery = () =>
  useQuery({
    queryKey: faqItemLinkQueryKeys.all,
    queryFn: fetchFaqItemLinks,
    staleTime: 60_000,
  });
