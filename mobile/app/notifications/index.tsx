import { Stack } from "expo-router";

import { NotificationsPage } from "@/features/notifications-page/ui/NotificationsPage";
import { NOTIFICATIONS_PAGE_UI } from "@/shared/config";

export default function NotificationsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: NOTIFICATIONS_PAGE_UI.TITLE }} />
      <NotificationsPage />
    </>
  );
}
