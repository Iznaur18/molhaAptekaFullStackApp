import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { HEADER_USERS_BUTTON_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

export const HomeCatalogUsersButton = () => {
  const router = useRouter();
  const styles = useHomeCatalogHeaderStyles();
  const { theme } = useAppThemeSettings();
  const sessionQuery = useAuthSessionQuery();
  const isAuthorized = sessionQuery.data?.user != null;

  if (!isAuthorized) {
    return null;
  }

  return (
    <View style={styles.usersNavPill}>
      <Pressable
        style={styles.usersButton}
        accessibilityRole="button"
        accessibilityLabel={HEADER_USERS_BUTTON_UI.ARIA}
        onPress={() => router.push("/users" as never)}
      >
        <MaterialIcons name="people" size={22} color={theme.colors.textSecondary} />
      </Pressable>
    </View>
  );
};
