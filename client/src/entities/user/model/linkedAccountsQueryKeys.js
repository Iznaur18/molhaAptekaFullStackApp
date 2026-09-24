export const linkedAccountsQueryKeys = {
  all: ["user", "linked-accounts"],
  /**
   * @param {string | null} activeUserId текущий пользователь; null — гость
   */
  forActive: (activeUserId) => [
    ...linkedAccountsQueryKeys.all,
    activeUserId ?? "guest",
  ],
};
