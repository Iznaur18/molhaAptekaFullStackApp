import { useAuthSessionQuery } from "./useAuthSessionQuery";

export const useIsAuthorized = (): boolean => {
  const sessionQuery = useAuthSessionQuery();
  return Boolean(sessionQuery.data?.user) && !sessionQuery.isPending;
};
