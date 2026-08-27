import { Stack } from "expo-router";

import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

export default function ProfileStackLayout() {
  const { theme } = useAppThemeSettings();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="edit" />
    </Stack>
  );
}
