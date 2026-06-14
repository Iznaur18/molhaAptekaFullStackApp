import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type FollowingUser = {
  _id: string;
  userName?: string;
  isPremiumUser?: boolean;
  isUserDataConfirmed?: boolean;
  userProfilePhotoUrl?: string;
};

export type MyFollowingResponse = {
  users: FollowingUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const fetchMyFollowing = async ({
  page = 1,
  limit = 50,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<MyFollowingResponse> => {
  try {
    const { data } = await apiClient.get("/user/me/following", {
      params: { page, limit },
    });

    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      users: data.data.users ?? [],
      pagination: data.data.pagination,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_MY_FOLLOWING_FALLBACK));
  }
};

export const unfollowUser = async (userId: string): Promise<void> => {
  try {
    const { data } = await apiClient.delete(`/user/${userId}/follow`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.UNFOLLOW_USER_FALLBACK));
  }
};

export type FollowMutationResult = {
  isFollowing: boolean;
  followersCount?: number;
  followingCount?: number;
};

export const followUser = async (userId: string): Promise<FollowMutationResult> => {
  try {
    const { data } = await apiClient.post(`/user/${userId}/follow`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      isFollowing: Boolean(data.data?.isFollowing ?? true),
      followersCount: data.data?.followersCount,
      followingCount: data.data?.followingCount,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FOLLOW_USER_FALLBACK));
  }
};
