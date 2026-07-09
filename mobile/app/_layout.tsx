import { Sentry } from "@/shared/lib/initMobileSentry";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { createAppQueryClient } from "@/shared/api";
import { LEGAL_UI } from "@/shared/config";
import {
  COLD_START_SPLASH_MAX_WAIT_MS,
  releaseColdStartSplash,
} from "@/shared/model/coldStartSplashGate";
import { AppProviders } from "@/shared/providers/AppProviders";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 300 });

function RootLayout() {
  const [queryClient] = useState(() => createAppQueryClient());
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) {
      // Иначе ErrorBoundary отрисуется под сплэшем и экран останется пустым.
      releaseColdStartSplash();
      throw error;
    }
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders queryClient={queryClient}>
        <RootLayoutNav />
      </AppProviders>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { colorScheme, theme } = useAppThemeSettings();
  const pathname = usePathname();

  // Контентный гейт сплэша есть только у главной ("/"): холодный старт по
  // deep link на другой экран прячет сплэш сразу, как раньше.
  useEffect(() => {
    if (pathname !== "/") {
      releaseColdStartSplash();
    }
  }, [pathname]);

  // Страховка: сплэш не держится дольше лимита ни при каком сценарии
  // (упавший запрос, офлайн, экран без гейта).
  useEffect(() => {
    const timer = setTimeout(releaseColdStartSplash, COLD_START_SPLASH_MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);
  const navigationTheme =
    colorScheme === "dark"
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: theme.colors.bg,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            primary: theme.colors.action,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.colors.bg,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            primary: theme.colors.action,
          },
        };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerBackTitle: "Назад" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="notifications/index" options={{ headerShown: true }} />
        <Stack.Screen name="catalog-browser" options={{ headerShown: true }} />
        <Stack.Screen name="create-product" options={{ headerShown: false }} />
        <Stack.Screen name="edit-product/[id]" options={{ title: "Редактирование" }} />
        <Stack.Screen name="raffle/[id]" options={{ title: "Розыгрыш" }} />
        <Stack.Screen name="user/[id]" options={{ title: "Профиль" }} />
        <Stack.Screen name="user/[id]/edit" options={{ title: "Редактирование" }} />
        <Stack.Screen name="seller/[userId]" options={{ title: "Товары продавца" }} />
        <Stack.Screen name="legal/privacy" options={{ title: LEGAL_UI.PRIVACY_TITLE }} />
      </Stack>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
