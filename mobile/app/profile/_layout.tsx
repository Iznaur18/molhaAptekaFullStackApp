import { Stack } from "expo-router";

import { EDIT_PROFILE_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

export default function ProfileStackLayout() {
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
      <Stack.Screen name="edit" options={{ title: EDIT_PROFILE_UI.TITLE }} />
    </Stack>
  );
}
