import { useCatalogMainContentProps } from "../../widgets/app-shell/model/useCatalogMainContentProps.js";
import { useHomeHeaderProps } from "../../widgets/app-shell/model/useHomeHeaderProps.js";
import { useHomeMainContentProps } from "../../widgets/app-shell/model/useHomeMainContentProps.js";
import { useHomeModalsLayerProps } from "../../widgets/app-shell/model/useHomeModalsLayerProps.js";

/** Сборка header / main / modals props для AppShellLayout. */
export function useAppShellPresentationLayer() {
  const headerProps = useHomeHeaderProps();
  const mainContentProps = useHomeMainContentProps();
  const modalsLayerProps = useHomeModalsLayerProps();
  const catalogContentProps = useCatalogMainContentProps();

  return {
    headerProps,
    catalogContentProps,
    accountContentProps: mainContentProps,
    mainContentProps,
    modalsLayerProps,
  };
}
