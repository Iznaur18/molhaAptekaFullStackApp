import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { HEADER_USERS_BUTTON_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useHomeCatalogSearchRowStyles } from "@/shared/theme/catalogProductStyles";

export const HomeCatalogUsersButton = () => {
  const router = useRouter();
  const styles = useHomeCatalogSearchRowStyles();
  const { theme } = useAppThemeSettings();
  const sessionQuery = useAuthSessionQuery();
  const isAuthorized = sessionQuery.data?.user != null;

  if (!isAuthorized) {
    return null;
  }

  return (
    <Pressable
      style={styles.usersButton}
      accessibilityRole="button"
      accessibilityLabel={HEADER_USERS_BUTTON_UI.ARIA}
      onPress={() => router.push("/users" as never)}
    >
      <MaterialIcons name="people" size={20} color={theme.colors.action} />
    </Pressable>
  );
};
