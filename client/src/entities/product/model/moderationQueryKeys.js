export const moderationQueryKeys = {
  all: ["product", "moderation"],
  count: () => [...moderationQueryKeys.all, "count"],
  /**
   * @param {{ limit?: number }} params
   */
  pending: (params) => [...moderationQueryKeys.all, "pending", params],
};
