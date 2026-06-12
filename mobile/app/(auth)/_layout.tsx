import { Stack } from "expo-router";

import { AUTH_UI } from "@/shared/config";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Назад",
      }}
    >
      <Stack.Screen name="login" options={{ title: AUTH_UI.LOGIN_TITLE }} />
      <Stack.Screen name="register" options={{ title: AUTH_UI.REGISTER_TITLE }} />
    </Stack>
  );
}
