import { createContext, useContext, useMemo, type ReactNode } from "react";

type HomeCatalogSearchContextValue = {
  value: string;
  onChange: (value: string) => void;
  /** Запуск поиска: только по «Найти» на клавиатуре, не по вводу. */
  onSubmit: () => void;
};

const HomeCatalogSearchContext = createContext<HomeCatalogSearchContextValue | null>(null);

type HomeCatalogSearchProviderProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  children: ReactNode;
};

export const HomeCatalogSearchProvider = ({
  value,
  onChange,
  onSubmit,
  children,
}: HomeCatalogSearchProviderProps) => {
  const contextValue = useMemo(
    () => ({
      value,
      onChange,
      onSubmit,
    }),
    [onChange, onSubmit, value],
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
