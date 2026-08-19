import { useState } from "react";

import { POPULAR_CATEGORIES_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import { PopularProductsAdminCategoriesTab } from "./PopularProductsAdminCategoriesTab.jsx";
import { PopularProductsAdminProductsTab } from "./PopularProductsAdminProductsTab.jsx";

import "./PopularProductsAdminPage.css";

export function PopularProductsAdminPage() {
  const [activeTab, setActiveTab] = useState(/** @type {"products" | "categories"} */ ("products"));

  return (
    <div className="popular-products-admin">
      <div
        className="popular-products-admin__tabs"
        role="tablist"
        aria-label={POPULAR_CATEGORIES_ADMIN_PAGE_UI.TITLE}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "products"}
          className={[
            "popular-products-admin__tab",
            activeTab === "products" && "popular-products-admin__tab_active",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setActiveTab("products")}
        >
          {POPULAR_CATEGORIES_ADMIN_PAGE_UI.TAB_PRODUCTS}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "categories"}
          className={[
            "popular-products-admin__tab",
            activeTab === "categories" && "popular-products-admin__tab_active",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setActiveTab("categories")}
        >
          {POPULAR_CATEGORIES_ADMIN_PAGE_UI.TAB_CATEGORIES}
        </button>
      </div>

      {activeTab === "products" ? (
        <PopularProductsAdminProductsTab />
      ) : (
        <PopularProductsAdminCategoriesTab />
      )}
    </div>
  );
}
