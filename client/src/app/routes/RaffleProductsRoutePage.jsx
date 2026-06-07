import { useParams } from "react-router-dom";

import { LazyRaffleProductsPage } from "../lib/lazyAppShellPages.js";
import { useAppShell } from "../model/AppShellContext.jsx";

/** Товары розыгрыша — `/raffle/:raffleId`. */
export function RaffleProductsRoutePage() {
  const { raffleId } = useParams();
  const { mainContentProps } = useAppShell();
  const {
    isAuthorized,
    currentUserId,
    goToMainView,
    onRequestLogin,
    onSellerNameClick,
    onOpenProductDetails,
  } = mainContentProps;

  if (!raffleId) {
    return null;
  }

  return (
    <LazyRaffleProductsPage
      raffleId={raffleId}
      isAuthorized={isAuthorized}
      currentUserId={currentUserId}
      onRequestLoginAddToCart={onRequestLogin}
      onSellerNameClick={onSellerNameClick}
      onOpenProductDetails={onOpenProductDetails}
      onBackToCatalog={() => goToMainView("catalog")}
    />
  );
}
