import { Stack } from "expo-router";

import { MY_ORDERS_PAGE_UI } from "@/shared/config";

export default function OrdersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: MY_ORDERS_PAGE_UI.TITLE }} />
    </Stack>
  );
}
