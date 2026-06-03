import { useEffect, useState } from "react";

import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";

/**
 * @returns {[{ isAuthorized: boolean; isAuthReady: boolean }, (value: boolean) => void]}
 */
export const useAuthBootstrap = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      try {
        await fetchCurrentUserProfile();
        if (!isCancelled) {
          setIsAuthorized(true);
        }
      } catch {
        if (!isCancelled) {
          setIsAuthorized(false);
        }
      } finally {
        if (!isCancelled) {
          setIsAuthReady(true);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  return [{ isAuthorized, isAuthReady }, setIsAuthorized];
};
