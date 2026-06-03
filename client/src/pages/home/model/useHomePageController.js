import { useLocation, useNavigate } from "react-router-dom";

import { useHomePageDomain } from "./useHomePageDomain.js";
import { useHomePagePresentationLayer } from "./useHomePagePresentationLayer.js";
import { useHomePageShellState } from "./useHomePageShellState.js";

import { useCart } from "../../../entities/cart/model/useCart.js";

export function useHomePageController() {
  const { flushRemoteCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const shell = useHomePageShellState(location, navigate);
  const domain = useHomePageDomain(shell, flushRemoteCart, location, navigate);

  const { headerProps, mainContentProps, modalsLayerProps } =
    useHomePagePresentationLayer({
      ...shell,
      ...domain,
    });

  return {
    isAuthorized: shell.isAuthorized,
    isSessionReady: shell.isSessionReady,
    isEmailVerified: shell.isEmailVerified,
    headerProps,
    mainContentProps,
    modalsLayerProps,
  };
}
