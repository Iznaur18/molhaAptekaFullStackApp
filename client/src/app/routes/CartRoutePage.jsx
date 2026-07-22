import { LazyCartPage } from "../../widgets/app-shell/lib/lazyAppShellPages.js";
import { useAppShell } from "../model/AppShellContext.jsx";

/** UI корзины — путь `/basket` (не `/cart`: proxy Vite → API). */
export function CartRoutePage() {
  const { mainContentProps, goToMainView } = useAppShell();
  const {
    isAuthorized,
    currentUserId,
    refreshUserProfileActionBadgeCounts,
    onRequestLogin,
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
    />
  );
}
