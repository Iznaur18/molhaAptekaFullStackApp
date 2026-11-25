import { Stack } from "expo-router";

import { usePageBackground } from "@/shared/theme/usePageBackground";

export default function ProfileStackLayout() {
  const pageBackground = usePageBackground();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: pageBackground },
      }}
    >
      <Stack.Screen name="edit" />
    </Stack>
  );
}
