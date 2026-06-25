import { TextInput, View } from "react-native";

import { CATALOG_FILTER_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogHeaderSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export const HomeCatalogHeaderSearch = ({ value, onChange }: HomeCatalogHeaderSearchProps) => {
  const styles = useHomeCatalogHeaderStyles();
  const theme = useAppTheme();

  return (
    <View style={styles.searchWrap}>
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChange}
        placeholder={CATALOG_FILTER_UI.SEARCH_PLACEHOLDER}
        placeholderTextColor={theme.colors.textMuted}
        autoCorrect={false}
        clearButtonMode="while-editing"
        accessibilityLabel={CATALOG_FILTER_UI.SEARCH_PLACEHOLDER}
      />
    </View>
  );
};
