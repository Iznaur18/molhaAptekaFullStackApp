import { useCallback, useEffect, useState } from "react";

/**
 * @param {object} params
 */
export function useEmailVerificationGate({
  isAuthorized,
  isSessionReady,
  isEmailVerified,
  handleLogout,
}) {
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthorized) {
      setIsEmailVerificationModalOpen(false);
      return undefined;
    }

    if (isSessionReady && !isEmailVerified) {
      setIsEmailVerificationModalOpen(true);
      return undefined;
    }

    if (isEmailVerified) {
      setIsEmailVerificationModalOpen(false);
    }

    return undefined;
  }, [isAuthorized, isEmailVerified, isSessionReady]);

  const handleEmailVerificationModalClose = useCallback(() => {
    setIsEmailVerificationModalOpen(false);
    void handleLogout();
  }, [handleLogout]);

  return {
    isEmailVerificationModalOpen,
    handleEmailVerificationModalClose,
  };
}
