import { useCatalogMainContentProps } from "../../pages/home/model/useCatalogMainContentProps.js";
import { useHomeHeaderProps } from "../../pages/home/model/useHomeHeaderProps.js";
import { useHomeMainContentProps } from "../../pages/home/model/useHomeMainContentProps.js";
import { useHomeModalsLayerProps } from "../../pages/home/model/useHomeModalsLayerProps.js";

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
