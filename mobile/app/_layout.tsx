import { Sentry } from "@/shared/lib/initMobileSentry";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { createAppQueryClient } from "@/shared/api";
import { LEGAL_UI } from "@/shared/config";
import { AppProviders } from "@/shared/providers/AppProviders";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [queryClient] = useState(() => createAppQueryClient());
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
