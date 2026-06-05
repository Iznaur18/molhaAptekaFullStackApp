import { CatalogMainContent } from "../../pages/catalog/ui/CatalogMainContent.jsx";
import { useAppShell } from "../model/AppShellContext.jsx";

/** `/` и `/catalog` — лента и browser landing. */
export function CatalogRoutePage() {
  const { catalogContentProps } = useAppShell();
  return <CatalogMainContent {...catalogContentProps} />;
}
