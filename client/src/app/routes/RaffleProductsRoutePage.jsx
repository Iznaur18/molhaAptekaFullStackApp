import { useParams } from "react-router-dom";

import { LazyRaffleProductsPage } from "../../widgets/app-shell/lib/lazyAppShellPages.js";
import { useAppShell } from "../model/AppShellContext.jsx";

/** Товары розыгрыша — `/raffle/:raffleId`. */
export function RaffleProductsRoutePage() {
  const { raffleId } = useParams();
  const { mainContentProps } = useAppShell();
  const {
    isAuthorized,
    currentUserId,
    canModerateProducts,
    onRequestLogin,
    onSellerNameClick,
    onOpenProductDetails,
    setRaffleModal,
    refreshRaffleSurfaces,
  } = mainContentProps;

  if (!raffleId) {
    return null;
  }

  return (
    <LazyRaffleProductsPage
      raffleId={raffleId}
      isAuthorized={isAuthorized}
      currentUserId={currentUserId}
      canModerateProducts={canModerateProducts}
      onRequestLoginAddToCart={onRequestLogin}
      onSellerNameClick={onSellerNameClick}
      onOpenProductDetails={onOpenProductDetails}
      setRaffleModal={setRaffleModal}
      refreshRaffleSurfaces={refreshRaffleSurfaces}
    />
  );
}
