import { LazyInstallmentModerationPage } from "../../../pages/home/lib/lazyHomePages.js";
import { useAppShell } from "../../model/AppShellContext.jsx";

export function InstallmentModerationRoutePage() {
  const { refreshPendingInstallmentModerationCount } = useAppShell().mainContentProps;

  return (
    <LazyInstallmentModerationPage
      onQueueChanged={refreshPendingInstallmentModerationCount}
    />
  );
}
