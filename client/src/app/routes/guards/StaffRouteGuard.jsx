import { useEffect } from "react";

import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { useAppShell } from "../../model/AppShellContext.jsx";

/**
 * @param {{
 *   requireAdmin?: boolean;
 *   requireModerator?: boolean;
 *   children: import('react').ReactNode;
 * }} props
 */
export function StaffRouteGuard({
  requireAdmin = false,
  requireModerator = false,
  children,
}) {
  const { isSessionReady, mainContentProps } = useAppShell();
  const { isAdmin, canModerateProducts, goToMainView } = mainContentProps;

  const isAllowed =
    (requireAdmin ? isAdmin : true) && (requireModerator ? canModerateProducts : true);

  useEffect(() => {
    if (!isSessionReady) {
      return;
    }
    if (!isAllowed) {
      goToMainView("catalog");
    }
  }, [isAllowed, isSessionReady, goToMainView]);

  if (!isSessionReady) {
    return <p className="home-page__state">{HOME_PAGE_UI.LOADING_SESSION}</p>;
  }

  if (!isAllowed) {
    return null;
  }

  return children;
}
