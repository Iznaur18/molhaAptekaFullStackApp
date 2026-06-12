import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";

export const useIsAuthorized = (): boolean => {
  const sessionQuery = useAuthSessionQuery();
  return Boolean(sessionQuery.data?.user) && !sessionQuery.isPending;
};
