import { useEffect, useState } from "react";

import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";
import { EMAIL_VERIFICATION_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {object} params
 */
export const useHomeEmailVerifiedRedirect = ({
  location,
  navigate,
  isAuthorized,
  setIsEmailVerified,
}) => {
  const [emailVerificationNotice, setEmailVerificationNotice] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("emailVerified");
    if (!verified) {
      return undefined;
    }

    const rawMessage = params.get("message")?.trim();

    if (verified === "1") {
      setEmailVerificationNotice({
        kind: "success",
        message: rawMessage || EMAIL_VERIFICATION_UI.VERIFIED_SUCCESS,
      });

      if (isAuthorized) {
        void fetchCurrentUserProfile()
          .then(({ user }) => {
            setIsEmailVerified(user.isEmailVerified !== false);
          })
          .catch(() => {});
      }
    } else if (verified === "error") {
      setEmailVerificationNotice({
        kind: "error",
        message: rawMessage || EMAIL_VERIFICATION_UI.VERIFIED_ERROR,
      });
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

  useEffect(() => {
    if (!emailVerificationNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setEmailVerificationNotice(null);
    }, 8000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [emailVerificationNotice]);

  const dismissEmailVerificationNotice = () => {
    setEmailVerificationNotice(null);
  };

  return {
    emailVerificationNotice,
    dismissEmailVerificationNotice,
  };
};
