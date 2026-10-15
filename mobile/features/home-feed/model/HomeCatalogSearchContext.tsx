import { createContext, useContext, useMemo, type ReactNode } from "react";

type HomeCatalogSearchContextValue = {
  value: string;
  onChange: (value: string) => void;
  /** Запуск поиска: только по «Найти» на клавиатуре, не по вводу. */
  onSubmit: () => void;
  /** Окно фильтров открыто. */
  filtersOpen: boolean;
  /** В ленте выбраны фильтры окна. */
  filtersActive: boolean;
  onOpenFilters: () => void;
};

const HomeCatalogSearchContext = createContext<HomeCatalogSearchContextValue | null>(
  null,
);

type HomeCatalogSearchProviderProps = HomeCatalogSearchContextValue & {
  children: ReactNode;
};

export const HomeCatalogSearchProvider = ({
  value,
  onChange,
  onSubmit,
  filtersOpen,
  filtersActive,
  onOpenFilters,
  children,
}: HomeCatalogSearchProviderProps) => {
  const contextValue = useMemo(
    () => ({
      value,
      onChange,
      onSubmit,
      filtersOpen,
      filtersActive,
      onOpenFilters,
    }),
    [filtersActive, filtersOpen, onChange, onOpenFilters, onSubmit, value],
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
    throw new Error(
      "useHomeCatalogSearch must be used within HomeCatalogSearchProvider",
    );
  }
  return context;
};
