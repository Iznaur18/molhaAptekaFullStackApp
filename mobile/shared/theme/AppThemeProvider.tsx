import { resolveIzTheme, type ColorScheme, type IzTheme } from "@izibuy/design-tokens";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

import {
  loadThemePreference,
  saveThemePreference,
  type ThemePreference,
} from "@/shared/theme/themePreferenceStorage";

type AppThemeContextValue = {
  theme: IzTheme;
  colorScheme: ColorScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

const resolveColorScheme = (
  preference: ThemePreference,
  systemScheme: ColorScheme,
): ColorScheme => {
  if (preference === "system") {
    return systemScheme;
  }
  return preference;
};

type AppThemeProviderProps = {
  children: ReactNode;
};

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const systemScheme = useSystemColorScheme() === "dark" ? "dark" : "light";
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    void loadThemePreference().then((stored) => {
      setPreferenceState(stored);
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void saveThemePreference(next);
  }, []);

  const colorScheme = resolveColorScheme(preference, systemScheme);
  const theme = useMemo(() => resolveIzTheme(colorScheme), [colorScheme]);

  const value = useMemo(
    () => ({
      theme,
      colorScheme,
      preference,
      setPreference,
    }),
    [theme, colorScheme, preference, setPreference],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
};

export const useAppTheme = (): IzTheme => {
  const context = useContext(AppThemeContext);
  if (!context) {
    return resolveIzTheme("light");
  }
  return context.theme;
};

export const useAppThemeSettings = (): AppThemeContextValue => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppThemeSettings must be used within AppThemeProvider");
  }
  return context;
};
