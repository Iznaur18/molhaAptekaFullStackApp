import { USER_FOLLOW_MAX_LIST_LIMIT } from "@molha/api-contract";

/** Query `?list=` на `/subscriptions`. */
export const SUBSCRIPTIONS_LIST_QUERY_PARAM = "list";
export const SUBSCRIPTIONS_LIST_FOLLOWING = "following";
export const SUBSCRIPTIONS_LIST_FOLLOWERS = "followers";
export const SUBSCRIPTIONS_FOLLOWERS_SEARCH = `?${SUBSCRIPTIONS_LIST_QUERY_PARAM}=${SUBSCRIPTIONS_LIST_FOLLOWERS}`;

export const MY_FOLLOW_LIST_DEFAULT_LIMIT = USER_FOLLOW_MAX_LIST_LIMIT;
