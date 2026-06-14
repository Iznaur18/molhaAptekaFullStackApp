import { Stack } from "expo-router";

import { AUTH_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

export default function AuthLayout() {
  const { theme } = useAppThemeSettings();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Назад",
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="login" options={{ title: AUTH_UI.LOGIN_TITLE }} />
      <Stack.Screen name="register" options={{ title: AUTH_UI.REGISTER_TITLE }} />
    </Stack>
  );
}
