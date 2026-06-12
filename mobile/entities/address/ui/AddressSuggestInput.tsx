import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ADDRESS_DELIVERY_UI } from "@/shared/config";

import { mapDadataSuggestion } from "../lib/mapDadataSuggestion";
import {
  ADDRESS_SUGGEST_DEBOUNCE_MS,
  ADDRESS_SUGGEST_MIN_QUERY_LENGTH,
} from "../model/constants";
import { useAddressSuggestionsQuery } from "../model/useAddressSuggestionsQuery";
import type { AddressSuggestionDto, RuDeliveryAddressValue } from "../model/types";

const EMPTY_VALUE: RuDeliveryAddressValue = {
  line: "",
  flat: "",
  fiasId: "",
  geo: null,
  selectedFromSuggest: false,
};

type AddressSuggestInputProps = {
  value: RuDeliveryAddressValue;
  onChange: (next: RuDeliveryAddressValue) => void;
  disabled?: boolean;
  placeholder?: string;
};

export const AddressSuggestInput = ({
  value,
  onChange,
  disabled = false,
  placeholder,
}: AddressSuggestInputProps) => {
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const trimmedLine = value.line.trim();
  const suggestEnabled =
    trimmedLine.length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH && !value.selectedFromSuggest;

  useEffect(() => {
    if (!suggestEnabled) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(trimmedLine);
    }, ADDRESS_SUGGEST_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [suggestEnabled, trimmedLine]);

  const activeQuery = suggestEnabled ? debouncedQuery : "";

  const suggestionsQuery = useAddressSuggestionsQuery({
    query: activeQuery,
    enabled:
      suggestEnabled && activeQuery.length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH,
  });

  const suggestions = suggestEnabled ? (suggestionsQuery.data ?? []) : [];

  const patch = (patchValue: Partial<RuDeliveryAddressValue>) => {
    onChange({ ...EMPTY_VALUE, ...value, ...patchValue, flat: "" });
  };

  const handleLineChange = (text: string) => {
    patch({
      line: text,
      selectedFromSuggest: false,
      fiasId: "",
      geo: null,
    });
  };

  const handlePickSuggestion = (suggestion: AddressSuggestionDto) => {
    const mapped = mapDadataSuggestion(suggestion);
    patch({
      line: mapped.line,
      fiasId: mapped.fiasId,
      geo: mapped.geo,
      selectedFromSuggest: true,
    });
    setDebouncedQuery("");
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{ADDRESS_DELIVERY_UI.LABEL_LINE}</Text>
      <TextInput
        style={styles.input}
        value={value.line}
        onChangeText={handleLineChange}
        placeholder={placeholder}
        editable={!disabled}
        autoCorrect={false}
      />

      {suggestEnabled && suggestionsQuery.isPending ? (
        <ActivityIndicator style={styles.loader} />
      ) : null}

      {suggestEnabled && suggestions.length > 0 ? (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => `${item.value}-${index}`}
          style={styles.suggestions}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable style={styles.suggestionRow} onPress={() => handlePickSuggestion(item)}>
              <Text style={styles.suggestionText}>{item.value}</Text>
            </Pressable>
          )}
        />
      ) : null}

      {suggestEnabled &&
      !suggestionsQuery.isPending &&
      activeQuery.length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH &&
      suggestions.length === 0 ? (
        <Text style={styles.hint}>{ADDRESS_DELIVERY_UI.NO_SUGGESTIONS}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  loader: {
    marginTop: 8,
  },
  suggestions: {
    maxHeight: 160,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
  },
  suggestionRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
    color: "#222",
  },
  hint: {
    marginTop: 8,
    fontSize: 13,
    color: "#999",
  },
});
