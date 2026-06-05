import { LazyInstallmentDisputesPage } from "../../../pages/home/lib/lazyHomePages.js";
import { useAppShell } from "../../model/AppShellContext.jsx";

export function InstallmentDisputesRoutePage() {
  const { refreshPendingInstallmentDisputesCount } = useAppShell().mainContentProps;

  return (
    <LazyInstallmentDisputesPage
      onQueueChanged={refreshPendingInstallmentDisputesCount}
    />
  );
}
