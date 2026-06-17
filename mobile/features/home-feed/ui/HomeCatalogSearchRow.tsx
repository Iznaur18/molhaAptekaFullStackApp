import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CatalogSearchBar } from "@/features/catalog-filter/ui/CatalogSearchBar";
import { HEADER_USERS_BUTTON_UI } from "@/shared/config";
import { useHomeCatalogSearchRowStyles } from "@/shared/theme/catalogProductStyles";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

type HomeCatalogSearchRowProps = {
  value: string;
  onChange: (value: string) => void;
};

export const HomeCatalogSearchRow = ({ value, onChange }: HomeCatalogSearchRowProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useHomeCatalogSearchRowStyles();
  const { theme } = useAppThemeSettings();
  const sessionQuery = useAuthSessionQuery();
  const isAuthorized = sessionQuery.data?.user != null;

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 8) }]}>
      <CatalogSearchBar value={value} onChange={onChange} embedded />
      {isAuthorized ? (
        <Pressable
          style={styles.usersButton}
          accessibilityRole="button"
          accessibilityLabel={HEADER_USERS_BUTTON_UI.ARIA}
          onPress={() => router.push("/users" as never)}
        >
          <MaterialIcons name="people" size={20} color={theme.colors.action} />
        </Pressable>
      ) : null}
    </View>
  );
};
