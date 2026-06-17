import { createContext, useContext } from "react";

/**
 * @typedef {object} AppShellCatalogSectionsValue
 * @property {import('react').ReactNode} catalogGridSection
 * @property {import('react').ReactNode} catalogBrowserSection
 */

/** @type {import('react').Context<AppShellCatalogSectionsValue | null>} */
const AppShellCatalogSectionsContext = createContext(null);

/**
 * @param {import('react').ReactNode} children
 * @param {AppShellCatalogSectionsValue} value
 */
export function AppShellCatalogSectionsProvider({ children, value }) {
  return (
    <AppShellCatalogSectionsContext.Provider value={value}>
      {children}
    </AppShellCatalogSectionsContext.Provider>
  );
}

/** @returns {AppShellCatalogSectionsValue} */
export function useAppShellCatalogSections() {
  const value = useContext(AppShellCatalogSectionsContext);
  if (!value) {
    throw new Error("useAppShellCatalogSections: секции каталога не инициализированы");
  }
  return value;
}
