import { useParams } from "react-router-dom";

import { LazySellerProductsPage } from "../../widgets/app-shell/lib/lazyAppShellPages.js";
import { useAppShell } from "../model/AppShellContext.jsx";

/** Каталог товаров продавца — `/seller/:userId`. */
export function SellerProductsRoutePage() {
  const { userId } = useParams();
  const { mainContentProps, goToMainView } = useAppShell();
  const {
    isAuthorized,
    isSessionReady,
    currentUserId,
    onRequestLogin,
    onSellerNameClick,
    onOpenProductDetails,
  } = mainContentProps;

  if (!userId) {
    return null;
  }

  return (
    <LazySellerProductsPage
      sellerId={userId}
      isAuthorized={isAuthorized}
      isSessionReady={isSessionReady}
      currentUserId={currentUserId}
      onRequestLogin={onRequestLogin}
      onRequestLoginAddToCart={onRequestLogin}
      onSellerNameClick={onSellerNameClick}
      onOpenProductDetails={onOpenProductDetails}
      onGoToMyProducts={() => goToMainView("my-products")}
    />
  );
}
