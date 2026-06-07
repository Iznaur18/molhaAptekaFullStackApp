import { EmailVerificationModal } from "../../../entities/user/ui/EmailVerificationModal.jsx";
import { LoginModal } from "../../../entities/user/ui/LoginModal.jsx";
import { RegisterModal } from "../../../entities/user/ui/RegisterModal.jsx";
import { EMAIL_VERIFICATION_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   isLoginModalOpen: boolean;
 *   setIsLoginModalOpen: (open: boolean) => void;
 *   setIsAuthorized: (value: boolean) => void;
 *   isRegisterModalOpen: boolean;
 *   setIsRegisterModalOpen: (open: boolean) => void;
 *   isEmailVerificationModalOpen: boolean;
 *   currentUserEmail: string;
 *   handleEmailVerificationModalClose: () => void;
 *   setIsEmailVerified: (value: boolean) => void;
 *   setStaffActionNotice: (message: string) => void;
 * }} props
 */
export function AppShellAuthModals({
  isLoginModalOpen,
  setIsLoginModalOpen,
  setIsAuthorized,
  isRegisterModalOpen,
  setIsRegisterModalOpen,
  isEmailVerificationModalOpen,
  currentUserEmail,
  handleEmailVerificationModalClose,
  setIsEmailVerified,
  setStaffActionNotice,
}) {
  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsAuthorized(true);
          setIsLoginModalOpen(false);
        }}
        onRegisterClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          setIsAuthorized(true);
          setIsRegisterModalOpen(false);
        }}
      />
      <EmailVerificationModal
        isOpen={isEmailVerificationModalOpen}
        email={currentUserEmail}
        onClose={handleEmailVerificationModalClose}
        onVerified={() => {
          setIsEmailVerified(true);
          setStaffActionNotice(EMAIL_VERIFICATION_UI.VERIFIED_SUCCESS);
        }}
      />
    </>
  );
}
