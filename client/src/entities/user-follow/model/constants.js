import { USER_FOLLOW_MAX_LIST_LIMIT } from "@molha/api-contract";

export const IN_APP_NOTIFICATION_KIND_NEW_FOLLOWER = "user_new_follower";

export const IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_NEW_PRODUCT =
  "followed_seller_new_product";

export const IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_PRODUCT_DISCOUNT =
  "followed_seller_product_discount";

/** Query `?list=` на `/subscriptions`. */
export const SUBSCRIPTIONS_LIST_QUERY_PARAM = "list";
export const SUBSCRIPTIONS_LIST_FOLLOWING = "following";
export const SUBSCRIPTIONS_LIST_FOLLOWERS = "followers";
export const SUBSCRIPTIONS_FOLLOWERS_SEARCH = `?${SUBSCRIPTIONS_LIST_QUERY_PARAM}=${SUBSCRIPTIONS_LIST_FOLLOWERS}`;

/** Default page size for `/user/me/following` и `/user/me/followers`. */
export const MY_FOLLOW_LIST_DEFAULT_LIMIT = USER_FOLLOW_MAX_LIST_LIMIT;
