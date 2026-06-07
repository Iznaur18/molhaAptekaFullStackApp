import { useMutation } from "@tanstack/react-query";

import { recordProductView } from "../api/recordProductView.js";

export function useRecordProductViewMutation() {
  return useMutation({
    mutationFn: recordProductView,
  });
}
