import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TextInput, View } from "react-native";
import { CATALOG_SEARCH_QUERY_MAX_LENGTH } from "@molha/api-contract";

import { CATALOG_FILTER_UI } from "@/shared/config";
import { HOME_CATALOG_HEADER_SEARCH_ICON_SIZE } from "@/shared/lib/homeCatalogHeaderLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogHeaderSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export const HomeCatalogHeaderSearch = ({
  value,
  onChange,
  onSubmit,
}: HomeCatalogHeaderSearchProps) => {
  const styles = useHomeCatalogHeaderStyles();
  const theme = useAppTheme();

  return (
    <View style={styles.searchWrap}>
      <MaterialIcons
        name="search"
        size={HOME_CATALOG_HEADER_SEARCH_ICON_SIZE}
        color={theme.colors.textMuted}
        style={styles.searchIcon}
        pointerEvents="none"
      />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholder={CATALOG_FILTER_UI.SEARCH_PLACEHOLDER}
        placeholderTextColor={theme.colors.textMuted}
        autoCorrect={false}
        clearButtonMode="while-editing"
        maxLength={CATALOG_SEARCH_QUERY_MAX_LENGTH}
        accessibilityLabel={CATALOG_FILTER_UI.SEARCH_PLACEHOLDER}
      />
    </View>
  );
};
