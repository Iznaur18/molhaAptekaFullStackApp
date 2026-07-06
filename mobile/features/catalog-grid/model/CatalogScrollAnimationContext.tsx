import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSharedValue, type SharedValue } from "react-native-reanimated";

type CatalogScrollAnimationContextValue = {
  scrollY: SharedValue<number>;
  scrollDirection: SharedValue<number>;
};

const CatalogScrollAnimationContext = createContext<CatalogScrollAnimationContextValue | null>(
  null,
);

type CatalogScrollAnimationProviderProps = {
  children: ReactNode;
};

export const CatalogScrollAnimationProvider = ({ children }: CatalogScrollAnimationProviderProps) => {
  const scrollY = useSharedValue(0);
  const scrollDirection = useSharedValue(1);
  const value = useMemo(
    () => ({
      scrollY,
      scrollDirection,
    }),
    [scrollDirection, scrollY],
  );

  return (
    <CatalogScrollAnimationContext.Provider value={value}>
      {children}
    </CatalogScrollAnimationContext.Provider>
  );
};

export const useCatalogScrollAnimation = (): CatalogScrollAnimationContextValue | null =>
  useContext(CatalogScrollAnimationContext);
