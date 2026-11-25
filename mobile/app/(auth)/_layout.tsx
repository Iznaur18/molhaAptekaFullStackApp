import { Stack } from "expo-router";

import { usePageBackground } from "@/shared/theme/usePageBackground";

export default function AuthLayout() {
  const pageBackground = usePageBackground();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: pageBackground },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
