import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  answerProductQuestion,
  askProductQuestion,
  deleteMyProductQuestion,
  hideProductQuestion,
} from "../api/productQuestionApi";
import { productQuestionQueryKeys } from "./productQuestionQueryKeys";

export const useProductQuestionMutations = (productId: string) => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: productQuestionQueryKeys.list(productId),
      }),
      queryClient.invalidateQueries({
        queryKey: productQuestionQueryKeys.summary(productId),
      }),
    ]);

  const askMutation = useMutation({
    mutationFn: (payload: { text: string }) => askProductQuestion(productId, payload),
    onSuccess: () => invalidate(),
  });

  const answerMutation = useMutation({
    mutationFn: ({ questionId, text }: { questionId: string; text: string }) =>
      answerProductQuestion(productId, questionId, { text }),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (questionId: string) => deleteMyProductQuestion(productId, questionId),
    onSuccess: () => invalidate(),
  });

  const hideMutation = useMutation({
    mutationFn: (questionId: string) => hideProductQuestion(productId, questionId),
    onSuccess: () => invalidate(),
  });

  return { askMutation, answerMutation, deleteMutation, hideMutation };
};
