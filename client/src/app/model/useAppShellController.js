import { useLocation, useNavigate } from "react-router-dom";

import { useCart } from "../../entities/cart/model/useCart.js";
import { useHomePageDomain } from "../../pages/home/model/useHomePageDomain.js";
import { useHomePagePresentationLayer } from "../../pages/home/model/useHomePagePresentationLayer.js";
import { useHomePageShellState } from "../../pages/home/model/useHomePageShellState.js";

/**
 * @typedef {ReturnType<typeof useAppShellController>} AppShellControllerValue
 */

export function useAppShellController() {
  const { flushRemoteCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const shell = useHomePageShellState(location, navigate);
  const domain = useHomePageDomain(shell, flushRemoteCart, location, navigate);

  const {
    headerProps,
    catalogContentProps,
    accountContentProps,
    mainContentProps,
    modalsLayerProps,
  } = useHomePagePresentationLayer({
    ...shell,
    ...domain,
  });

  return {
    isAuthorized: shell.isAuthorized,
    isSessionReady: shell.isSessionReady,
    isEmailVerified: shell.isEmailVerified,
    emailVerificationNotice: shell.emailVerificationNotice,
    dismissEmailVerificationNotice: shell.dismissEmailVerificationNotice,
    staffActionNotice: shell.staffActionNotice,
    headerProps,
    catalogContentProps,
    accountContentProps,
    mainContentProps,
    modalsLayerProps,
  };
}
