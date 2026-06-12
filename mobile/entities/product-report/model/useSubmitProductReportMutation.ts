import { useMutation } from "@tanstack/react-query";

import { submitProductReport } from "@/entities/product-report/api/submitProductReport";

export const useSubmitProductReportMutation = () =>
  useMutation({
    mutationFn: ({
      productId,
      reportText,
    }: {
      productId: string;
      reportText: string;
    }) => submitProductReport(productId, reportText),
  });
