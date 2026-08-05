import { Stack } from "expo-router";

import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

export default function AuthLayout() {
  const { theme } = useAppThemeSettings();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
