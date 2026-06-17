import { Pressable, Text, TextInput, View } from "react-native";

import { CATALOG_FILTER_UI } from "@/shared/config";
import { useCatalogSearchBarStyles } from "@/shared/theme/catalogProductStyles";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type CatalogSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  embedded?: boolean;
};

export const CatalogSearchBar = ({ value, onChange, embedded = false }: CatalogSearchBarProps) => {
  const styles = useCatalogSearchBarStyles();
  const theme = useAppTheme();

  return (
    <View style={[styles.wrap, embedded && styles.wrapEmbedded]}>
      <TextInput
        style={[styles.input, embedded && styles.inputEmbedded]}
        value={value}
        onChangeText={onChange}
        placeholder={CATALOG_FILTER_UI.SEARCH_PLACEHOLDER}
        placeholderTextColor={theme.colors.textMuted}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChange("")} style={styles.clear}>
          <Text style={styles.clearText}>{CATALOG_FILTER_UI.CLEAR_SEARCH}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
