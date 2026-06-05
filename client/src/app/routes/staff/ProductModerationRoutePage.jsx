import { LazyProductModerationPage } from "../../../pages/home/lib/lazyHomePages.js";
import { useAppShell } from "../../model/AppShellContext.jsx";

export function ProductModerationRoutePage() {
  const { onSellerNameClick, refreshPendingModerationCount } =
    useAppShell().mainContentProps;

  return (
    <LazyProductModerationPage
      onSellerNameClick={onSellerNameClick}
      onQueueChanged={refreshPendingModerationCount}
    />
  );
}
