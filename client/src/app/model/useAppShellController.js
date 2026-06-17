import { useAppShellStateContext } from "../../widgets/app-shell/model/AppShellStateContext.jsx";
import { useAppShellPresentationLayer } from "./useAppShellPresentationLayer.js";

/**
 * @typedef {ReturnType<typeof useAppShellController>} AppShellControllerValue
 */

export function useAppShellController() {
  const ctx = useAppShellStateContext();
  const {
    headerProps,
    catalogContentProps,
    accountContentProps,
    mainContentProps,
    modalsLayerProps,
  } = useAppShellPresentationLayer();

  return {
    isAuthorized: ctx.isAuthorized,
    isSessionReady: ctx.isSessionReady,
    isEmailVerified: ctx.isEmailVerified,
    emailVerificationNotice: ctx.emailVerificationNotice,
    dismissEmailVerificationNotice: ctx.dismissEmailVerificationNotice,
    staffActionNotice: ctx.staffActionNotice,
    goToMainView: ctx.goToMainView,
    headerProps,
    catalogContentProps,
    accountContentProps,
    mainContentProps,
    modalsLayerProps,
  };
}
