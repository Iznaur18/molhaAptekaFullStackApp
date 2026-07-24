import { EmailVerificationModal } from "../../../entities/user/ui/EmailVerificationModal.jsx";
import { EMAIL_VERIFICATION_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Login/Register — full-screen `/login` `/register` (parity with mobile).
 * Здесь только email-verify после сессии.
 *
 * @param {{
 *   isEmailVerificationModalOpen: boolean;
 *   currentUserEmail: string;
 *   handleEmailVerificationModalClose: () => void;
 *   setIsEmailVerified: (value: boolean) => void;
 *   setStaffActionNotice: (message: string) => void;
 * }} props
 */
export function AppShellAuthModals({
  isEmailVerificationModalOpen,
  currentUserEmail,
  handleEmailVerificationModalClose,
  setIsEmailVerified,
  setStaffActionNotice,
}) {
  return (
    <EmailVerificationModal
      isOpen={isEmailVerificationModalOpen}
      email={currentUserEmail}
      onClose={handleEmailVerificationModalClose}
      onVerified={() => {
        setIsEmailVerified(true);
        setStaffActionNotice(EMAIL_VERIFICATION_UI.VERIFIED_SUCCESS);
      }}
    />
  );
}
