import { LazyCartPage } from "../../pages/home/lib/lazyHomePages.js";
import { useAppShell } from "../model/AppShellContext.jsx";

/** UI корзины — путь `/basket` (не `/cart`: proxy Vite → API). */
export function CartRoutePage() {
  const { mainContentProps } = useAppShell();
  const {
    isAuthorized,
    currentUserId,
    goToMainView,
    refreshUserProfileActionBadgeCounts,
    onRequestLogin,
    onSellerNameClick,
  } = mainContentProps;

  return (
    <LazyCartPage
      isAuthorized={isAuthorized}
      currentUserId={currentUserId}
      onRequestLogin={onRequestLogin}
      onGoToCatalog={() => goToMainView("catalog")}
      onCheckoutSuccess={() => {
        void refreshUserProfileActionBadgeCounts();
        goToMainView("my-orders");
      }}
      onSellerNameClick={onSellerNameClick}
    />
  );
}
