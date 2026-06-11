import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useCart } from "../../entities/cart/model/useCart.js";
import { useWishlist } from "../../entities/wishlist/model/useWishlist.js";
import { useHomeCatalogSections } from "../../pages/home/model/useHomeCatalogSections.jsx";
import { AppShellCatalogSectionsProvider } from "../model/AppShellCatalogSectionsContext.jsx";
import { AppShellStateProvider } from "../model/AppShellStateContext.jsx";
import { useAppShellController } from "../model/useAppShellController.js";
import { useAppShellDomain } from "../model/useAppShellDomain.js";
import { useAppShellState } from "../model/useAppShellState.js";
import { AppShellProvider } from "../model/AppShellContext.jsx";

import { AppShellLayout } from "./AppShellLayout.jsx";

function AppShellRootInner() {
  const controller = useAppShellController();

  return (
    <AppShellProvider value={controller}>
      <AppShellLayout />
    </AppShellProvider>
  );
}

/** Вычисляет JSX-секции каталога один раз и кладёт в контекст. */
function AppShellCatalogSectionsBridge({ children }) {
  const catalogSections = useHomeCatalogSections();

  return (
    <AppShellCatalogSectionsProvider value={catalogSections}>
      {children}
    </AppShellCatalogSectionsProvider>
  );
}

/**
 * Route layout root: один контроллер на всё дерево маршрутов под shell.
 */
export function AppShellRoot() {
  const { flushRemoteCart } = useCart();
  const { flushRemoteWishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const shell = useAppShellState(location, navigate);
  const domain = useAppShellDomain(shell, flushRemoteCart, flushRemoteWishlist, location, navigate);

  const appShellStateValue = useMemo(
    () => ({ ...shell, ...domain }),
    [shell, domain],
  );

  return (
    <AppShellStateProvider value={appShellStateValue}>
      <AppShellCatalogSectionsBridge>
        <AppShellRootInner />
      </AppShellCatalogSectionsBridge>
    </AppShellStateProvider>
  );
}
