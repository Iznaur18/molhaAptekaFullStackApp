import { useQuery } from "@tanstack/react-query";

import { fetchFaqItemLinks } from "../api/fetchFaqItemLinks.js";
import { faqItemLinkQueryKeys } from "./faqItemLinkQueryKeys.js";

export function useFaqItemLinksQuery() {
  return useQuery({
    queryKey: faqItemLinkQueryKeys.all,
    queryFn: fetchFaqItemLinks,
    staleTime: 60_000,
  });
}
