import { DataConfirmationRequestModal } from "../../../entities/user-data-confirmation/ui/DataConfirmationRequestModal.jsx";

/**
 * @param {{
 *   isDataConfirmationModalOpen: boolean;
 *   setIsDataConfirmationModalOpen: (open: boolean) => void;
 *   refreshDataConfirmationStatus: () => void | Promise<void>;
 *   refreshPendingDataConfirmationCount: () => void | Promise<void>;
 * }} props
 */
export function AppShellUserModals({
  isDataConfirmationModalOpen,
  setIsDataConfirmationModalOpen,
  refreshDataConfirmationStatus,
  refreshPendingDataConfirmationCount,
}) {
  return (
    <DataConfirmationRequestModal
      isOpen={isDataConfirmationModalOpen}
      onClose={() => setIsDataConfirmationModalOpen(false)}
      onSubmitted={() => {
        void refreshDataConfirmationStatus();
        void refreshPendingDataConfirmationCount();
      }}
    />
  );
}
