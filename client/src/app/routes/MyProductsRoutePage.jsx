import { useAppShell } from "../model/AppShellContext.jsx";

/** `/my-products` — та же сетка, что в профиле (isMineMode). */
export function MyProductsRoutePage() {
  const { catalogContentProps } = useAppShell();
  return catalogContentProps.catalogGridSection;
}
