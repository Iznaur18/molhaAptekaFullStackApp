import { useCallback, useEffect, useState } from "react";

/**
 * Модалка email-verify только если у юзера есть email и он не подтверждён.
 * Phone-only аккаунты (isPhoneVerified, без email) — не трогаем.
 *
 * @param {object} params
 */
export function useEmailVerificationGate({
  isAuthorized,
  isSessionReady,
  isEmailVerified,
  currentUserEmail,
  isPhoneVerified,
  handleLogout,
}) {
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);

  const needsEmailVerification =
    Boolean(String(currentUserEmail ?? "").trim()) && isEmailVerified !== true;

  useEffect(() => {
    if (!isAuthorized) {
      setIsEmailVerificationModalOpen(false);
      return undefined;
    }

    // Phone-регистрация: контакта email нет — гейт не нужен
    if (isPhoneVerified === true && !String(currentUserEmail ?? "").trim()) {
      setIsEmailVerificationModalOpen(false);
      return undefined;
    }

    if (isSessionReady && needsEmailVerification) {
      setIsEmailVerificationModalOpen(true);
      return undefined;
    }

    if (!needsEmailVerification) {
      setIsEmailVerificationModalOpen(false);
    }

    return undefined;
  }, [
    currentUserEmail,
    isAuthorized,
    isEmailVerified,
    isPhoneVerified,
    isSessionReady,
    needsEmailVerification,
  ]);

  const handleEmailVerificationModalClose = useCallback(() => {
    setIsEmailVerificationModalOpen(false);
    void handleLogout();
  }, [handleLogout]);

  return {
    isEmailVerificationModalOpen,
    handleEmailVerificationModalClose,
  };
}
