import { useMutation, useQueryClient } from "@tanstack/react-query";

import { answerProductQuestion } from "../api/answerProductQuestion.js";
import { askProductQuestion } from "../api/askProductQuestion.js";
import { deleteMyProductQuestion } from "../api/deleteMyProductQuestion.js";
import { hideProductQuestion } from "../api/hideProductQuestion.js";
import { invalidateAllProductQuestionQueries } from "../lib/productQuestionQueryCache.js";

/**
 * @param {string} productId
 */
export function useProductQuestionMutations(productId) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    invalidateAllProductQuestionQueries(queryClient, productId);

  const askMutation = useMutation({
    mutationFn: (payload) => askProductQuestion(productId, payload),
    onSuccess: () => invalidate(),
  });

  const answerMutation = useMutation({
    mutationFn: ({ questionId, text }) =>
      answerProductQuestion(productId, questionId, { text }),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (questionId) => deleteMyProductQuestion(productId, questionId),
    onSuccess: () => invalidate(),
  });

  const hideMutation = useMutation({
    mutationFn: (questionId) => hideProductQuestion(productId, questionId),
    onSuccess: () => invalidate(),
  });

  return {
    askMutation,
    answerMutation,
    deleteMutation,
    hideMutation,
  };
}
