import { useMutation } from "@tanstack/react-query";

import { submitProductReport } from "../api/submitProductReport.js";

export function useSubmitProductReportMutation() {
  return useMutation({
    mutationFn: ({ productId, reportText }) => submitProductReport(productId, reportText),
  });
}
