export const usersSearchQueryKeys = {
  all: ["users", "search"] as const,
  list: (search: string) => [...usersSearchQueryKeys.all, search] as const,
};
