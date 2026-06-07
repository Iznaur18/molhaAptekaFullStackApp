export const userStoriesQueryKeys = {
  all: ["user-stories"],
  feed: () => [...userStoriesQueryKeys.all, "feed"],
  /**
   * @param {string} authorId
   */
  byAuthor: (authorId) => [...userStoriesQueryKeys.all, "author", authorId],
};
