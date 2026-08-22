import { PRODUCT_QUESTION_LIMIT_DEFAULT } from "@molha/api-contract";

import { apiClient } from "@/shared/api";
import { API_CLIENT_UI, PRODUCT_QA_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type ProductQuestionStatus = "pending" | "answered" | "hidden";

export type ProductQuestionAuthor = {
  _id: string | null;
  userName: string;
};

export type ProductQuestionAnswer = {
  text: string;
  answeredAt: string | null;
};

export type ProductQuestion = {
  _id: string;
  productId: string;
  text: string;
  status: ProductQuestionStatus;
  answer: ProductQuestionAnswer | null;
  author: ProductQuestionAuthor;
  isMine: boolean;
  canDelete: boolean;
  createdAt: string;
  answeredAt: string | null;
};

export type ProductQuestionPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProductQuestionSummary = {
  qaEnabled: boolean;
  isSeller: boolean;
  publicCount: number;
  pendingCount: number;
  activeCount: number;
  remaining: number;
  limit: number;
  canAsk: boolean;
};

export type ProductQuestionsPage = {
  questions: ProductQuestion[];
  pagination: ProductQuestionPagination;
};

export const fetchProductQuestionSummary = async (
  productId: string,
): Promise<ProductQuestionSummary> => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/questions/summary`);
    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as ProductQuestionSummary;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, PRODUCT_QA_UI.FETCH_SUMMARY_FALLBACK),
    );
  }
};

export const fetchProductQuestionsPage = async (
  productId: string,
  params: { page?: number; limit?: number; status?: "pending" | "answered" } = {},
): Promise<ProductQuestionsPage> => {
  try {
    const query: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? PRODUCT_QUESTION_LIMIT_DEFAULT,
    };
    if (params.status) {
      query.status = params.status;
    }
    const { data } = await apiClient.get(`/product/${productId}/questions`, {
      params: query,
    });
    if (!data?.success || !Array.isArray(data.data?.questions)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      questions: data.data.questions as ProductQuestion[],
      pagination: data.data.pagination as ProductQuestionPagination,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, PRODUCT_QA_UI.FETCH_QUESTIONS_FALLBACK),
    );
  }
};

export const askProductQuestion = async (
  productId: string,
  payload: { text: string },
): Promise<{ question: ProductQuestion }> => {
  try {
    const { data } = await apiClient.post(`/product/${productId}/questions`, payload);
    if (!data?.success || data.data?.question == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { question: ProductQuestion };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, PRODUCT_QA_UI.ASK_FALLBACK));
  }
};

export const answerProductQuestion = async (
  productId: string,
  questionId: string,
  payload: { text: string },
): Promise<{ question: ProductQuestion }> => {
  try {
    const { data } = await apiClient.put(
      `/product/${productId}/questions/${questionId}/answer`,
      payload,
    );
    if (!data?.success || data.data?.question == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { question: ProductQuestion };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, PRODUCT_QA_UI.ANSWER_FALLBACK));
  }
};

export const deleteMyProductQuestion = async (
  productId: string,
  questionId: string,
): Promise<void> => {
  try {
    const { data } = await apiClient.delete(
      `/product/${productId}/questions/${questionId}`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, PRODUCT_QA_UI.DELETE_FALLBACK));
  }
};

export const hideProductQuestion = async (
  productId: string,
  questionId: string,
): Promise<void> => {
  try {
    const { data } = await apiClient.patch(
      `/product/${productId}/questions/${questionId}/hide`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, PRODUCT_QA_UI.HIDE_FALLBACK));
  }
};
