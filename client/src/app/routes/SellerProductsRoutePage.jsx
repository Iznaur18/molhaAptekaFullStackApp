import { useParams } from "react-router-dom";

import { LazySellerProductsPage } from "../lib/lazyAppShellPages.js";
import { useAppShell } from "../model/AppShellContext.jsx";

/** Каталог товаров продавца — `/seller/:userId`. */
export function SellerProductsRoutePage() {
  const { userId } = useParams();
  const { mainContentProps } = useAppShell();
  const {
    isAuthorized,
    isSessionReady,
    currentUserId,
    goToMainView,
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
      onBackToCatalog={() => goToMainView("catalog")}
      onGoToMyProducts={() => goToMainView("my-products")}
    />
  );
}
