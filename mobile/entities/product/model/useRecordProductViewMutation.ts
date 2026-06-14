import { useMutation } from "@tanstack/react-query";

import { recordProductView } from "../api/recordProductView";

export const useRecordProductViewMutation = () =>
  useMutation({
    mutationFn: recordProductView,
  });
