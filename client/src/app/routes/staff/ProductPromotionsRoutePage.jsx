import { LazyProductPromotionsStaffPage } from "../../../pages/home/lib/lazyHomePages.js";
import { useAppShell } from "../../model/AppShellContext.jsx";

export function ProductPromotionsRoutePage() {
  const { refreshPendingProductPromotionsCount, setCatalogRefreshTick } =
    useAppShell().mainContentProps;

  return (
    <LazyProductPromotionsStaffPage
      onQueueChanged={() => {
        void refreshPendingProductPromotionsCount();
        setCatalogRefreshTick((n) => n + 1);
      }}
    />
  );
}
