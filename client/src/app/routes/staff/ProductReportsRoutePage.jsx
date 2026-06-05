import { LazyProductReportsPage } from "../../../pages/home/lib/lazyHomePages.js";
import { useAppShell } from "../../model/AppShellContext.jsx";

export function ProductReportsRoutePage() {
  const { onSellerNameClick, onOpenProductDetails, refreshPendingProductReportsCount } =
    useAppShell().mainContentProps;

  return (
    <LazyProductReportsPage
      onSellerNameClick={onSellerNameClick}
      onProductClick={onOpenProductDetails}
      onQueueChanged={() => void refreshPendingProductReportsCount()}
    />
  );
}
