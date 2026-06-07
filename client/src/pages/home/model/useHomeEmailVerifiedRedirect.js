import { useEffect, useState } from "react";

import { EMAIL_VERIFICATION_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {object} params
 */
export const useHomeEmailVerifiedRedirect = ({
  location,
  navigate,
  isAuthorized,
  invalidateAuthMe,
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
        void invalidateAuthMe();
      }
    } else if (verified === "error") {
      setEmailVerificationNotice({
        kind: "error",
        message: rawMessage || EMAIL_VERIFICATION_UI.VERIFIED_ERROR,
      });
    }

    navigate(location.pathname, { replace: true });
    return undefined;
  }, [invalidateAuthMe, isAuthorized, location.pathname, location.search, navigate]);

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
