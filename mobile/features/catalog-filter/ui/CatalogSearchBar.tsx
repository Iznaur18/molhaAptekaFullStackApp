import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { CATALOG_FILTER_UI } from "@/shared/config";

type CatalogSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export const CatalogSearchBar = ({ value, onChange }: CatalogSearchBarProps) => {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={CATALOG_FILTER_UI.SEARCH_PLACEHOLDER}
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

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  clear: {
    paddingHorizontal: 4,
  },
  clearText: {
    color: "#1565c0",
    fontSize: 14,
  },
});
