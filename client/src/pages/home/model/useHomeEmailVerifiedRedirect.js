import { useEffect } from "react";

import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";

/**
 * @param {object} params
 */
export const useHomeEmailVerifiedRedirect = ({
  location,
  navigate,
  isAuthorized,
  setIsEmailVerified,
}) => {
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("emailVerified");
    if (!verified) {
      return undefined;
    }

    if (verified === "1" && isAuthorized) {
      void fetchCurrentUserProfile()
        .then(({ user }) => {
          setIsEmailVerified(user.isEmailVerified !== false);
        })
        .catch(() => {});
    }

    navigate(location.pathname, { replace: true });
    return undefined;
  }, [
    isAuthorized,
    location.pathname,
    location.search,
    navigate,
    setIsEmailVerified,
  ]);
};
