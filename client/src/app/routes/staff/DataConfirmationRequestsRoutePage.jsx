import { LazyDataConfirmationRequestsPage } from "../../../pages/home/lib/lazyHomePages.js";
import { useAppShell } from "../../model/AppShellContext.jsx";

export function DataConfirmationRequestsRoutePage() {
  const { onSellerNameClick, refreshPendingDataConfirmationCount } =
    useAppShell().mainContentProps;

  return (
    <LazyDataConfirmationRequestsPage
      onApplicantClick={onSellerNameClick}
      onQueueChanged={() => void refreshPendingDataConfirmationCount()}
    />
  );
}
