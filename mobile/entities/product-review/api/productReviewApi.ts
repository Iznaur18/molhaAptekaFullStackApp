import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type ProductReview = {
  _id: string;
  rating: number;
  text?: string;
  authorUserName?: string;
  createdAt: string;
};

export type ProductReviewSummary = {
  averageRating: number;
  reviewCount: number;
  canReview?: boolean;
  myReview?: ProductReview | null;
};

export const submitProductReview = async (
  productId: string,
  payload: { rating: number; text?: string },
) => {
  try {
    const { data } = await apiClient.post(`/product/${productId}/reviews`, payload);
    if (!data?.success || data.data?.review == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.review as ProductReview;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.SUBMIT_PRODUCT_REVIEW_FALLBACK),
    );
  }
};

export const fetchProductReviewSummary = async (
  productId: string,
): Promise<ProductReviewSummary> => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/reviews/summary`);
    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      averageRating: Number(data.data.averageRating) || 0,
      reviewCount: Number(data.data.reviewCount) || 0,
      canReview: data.data.canReview === true,
      myReview: data.data.myReview ?? null,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRODUCT_REVIEW_SUMMARY_FALLBACK),
    );
  }
};

export const fetchProductReviewsPage = async (
  productId: string,
  page = 1,
  limit = 20,
): Promise<{ reviews: ProductReview[]; pagination?: { page: number; totalPages: number } }> => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/reviews`, {
      params: { page, limit },
    });
    if (!data?.success || !Array.isArray(data.data?.reviews)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      reviews: data.data.reviews,
      pagination: data.data.pagination,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRODUCT_REVIEWS_FALLBACK));
  }
};
