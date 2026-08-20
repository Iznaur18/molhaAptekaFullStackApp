import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { CatalogMainContent } from "../../pages/catalog/ui/CatalogMainContent.jsx";
import { pathnameToCatalogMainView } from "../../shared/lib/catalogMainViewPaths.js";
import { isProductDetailsPath } from "../../shared/lib/productDetailsPaths.js";
import { useAppShell } from "../model/AppShellContext.jsx";

import "./CatalogProductShellLayout.css";

/**
 * `/`, `/catalog`, `/product/:id` — каталог остаётся смонтированным под
 * полноэкранными деталями, чтобы не мигало при входе/назад.
 */
export function CatalogProductShellLayout() {
  const location = useLocation();
  const { catalogContentProps } = useAppShell();
  const isProductDetails = isProductDetailsPath(location.pathname);
  const pathCatalogView = pathnameToCatalogMainView(location.pathname);
  const frozenCatalogViewRef = useRef(
    /** @type {'catalog' | 'catalog-browser'} */ (
      catalogContentProps.catalogMainView ?? "catalog"
    ),
  );

  if (pathCatalogView) {
    frozenCatalogViewRef.current = pathCatalogView;
  }

  const catalogMainView = isProductDetails
    ? frozenCatalogViewRef.current
    : catalogContentProps.catalogMainView;

  return (
    <>
      <div
        className={[
          "catalog-product-shell__catalog",
          isProductDetails && "catalog-product-shell__catalog--dormant",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={isProductDetails || undefined}
        {...(isProductDetails ? { inert: true } : {})}
      >
        <CatalogMainContent
          catalogMainView={catalogMainView}
          catalogGridSection={catalogContentProps.catalogGridSection}
          catalogBrowserSection={catalogContentProps.catalogBrowserSection}
        />
      </div>
      <Outlet />
    </>
  );
}
