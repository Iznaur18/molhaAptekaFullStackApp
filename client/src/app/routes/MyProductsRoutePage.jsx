import { AccountMainContent } from "../../pages/home/ui/AccountMainContent.jsx";
import { useAppShell } from "../model/AppShellContext.jsx";

/** `/my-products` — каталог в оболочке MyProfilePage. */
export function MyProductsRoutePage() {
  const { accountContentProps, catalogContentProps } = useAppShell();

  return (
    <AccountMainContent
      {...accountContentProps}
      myProductsCatalogSection={catalogContentProps.catalogGridSection}
    />
  );
}
