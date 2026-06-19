import { Sentry } from "@/shared/lib/initMobileSentry";
import "react-native-gesture-handler";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { AppIntroProvider } from "@/features/app-intro/model/AppIntroProvider";
import { AppIntroSplash } from "@/features/app-intro/ui/AppIntroSplash";
import { AppRuntimeSync } from "@/features/app-runtime/ui/AppRuntimeSync";
import { WishlistProvider } from "@/entities/wishlist/model/WishlistProvider";
import { WishlistServerSync } from "@/entities/wishlist/ui/WishlistServerSync";
import { createAppQueryClient } from "@/shared/api";
import { LEGAL_UI } from "@/shared/config";
import { AppThemeProvider, useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

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
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <WishlistProvider>
          <AppIntroProvider>
            <RootLayoutNav />
            <AppRuntimeSync />
            <WishlistServerSync />
            <AppIntroSplash />
          </AppIntroProvider>
        </WishlistProvider>
      </AppThemeProvider>
    </QueryClientProvider>
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
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="notifications/index" options={{ headerShown: true }} />
        <Stack.Screen name="catalog-browser" options={{ headerShown: true }} />
        <Stack.Screen name="create-product" options={{ title: "Новый товар" }} />
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
