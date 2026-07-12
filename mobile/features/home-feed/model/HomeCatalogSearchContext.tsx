import { createContext, useContext, useMemo, type ReactNode } from "react";

type HomeCatalogSearchContextValue = {
  value: string;
  onChange: (value: string) => void;
};

const HomeCatalogSearchContext = createContext<HomeCatalogSearchContextValue | null>(null);

type HomeCatalogSearchProviderProps = {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
};

export const HomeCatalogSearchProvider = ({
  value,
  onChange,
  children,
}: HomeCatalogSearchProviderProps) => {
  const contextValue = useMemo(
    () => ({
      value,
      onChange,
    }),
    [onChange, value],
  );

  return (
    <HomeCatalogSearchContext.Provider value={contextValue}>
      {children}
    </HomeCatalogSearchContext.Provider>
  );
};

export const useHomeCatalogSearch = (): HomeCatalogSearchContextValue => {
  const context = useContext(HomeCatalogSearchContext);
  if (context == null) {
    throw new Error("useHomeCatalogSearch must be used within HomeCatalogSearchProvider");
  }
  return context;
};
