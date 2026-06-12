import { Stack } from "expo-router";

import { EDIT_PROFILE_UI } from "@/shared/config";

export default function ProfileStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="edit" options={{ title: EDIT_PROFILE_UI.TITLE }} />
    </Stack>
  );
}
