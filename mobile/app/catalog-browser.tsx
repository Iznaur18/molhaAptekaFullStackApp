import { Stack } from "expo-router";

import { CatalogBrowserPage } from "@/features/catalog-browser/ui/CatalogBrowserPage";
import { CATALOG_BROWSER_UI } from "@/shared/config";

export default function CatalogBrowserScreen() {
  return (
    <>
      <Stack.Screen options={{ title: CATALOG_BROWSER_UI.TITLE }} />
      <CatalogBrowserPage />
    </>
  );
}
