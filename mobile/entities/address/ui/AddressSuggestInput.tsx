import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { ADDRESS_DELIVERY_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAddressSuggestStyles, useFormFieldStyles } from "@/shared/theme/formChromeStyles";

import { mapDadataSuggestion } from "../lib/mapDadataSuggestion";
import {
  ADDRESS_SUGGEST_DEBOUNCE_MS,
  ADDRESS_SUGGEST_MIN_QUERY_LENGTH,
} from "../model/constants";
import { useAddressSuggestionsQuery } from "../model/useAddressSuggestionsQuery";
import type { AddressSuggestionDto, RuDeliveryAddressValue } from "../model/types";

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
  const theme = useAppTheme();
  const fieldStyles = useFormFieldStyles();
  const suggestStyles = useAddressSuggestStyles();
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
    onChange({ ...value, ...patchValue });
  };

  const handleLineChange = (text: string) => {
    patch({
      line: text,
      selectedFromSuggest: false,
      fiasId: "",
      geo: null,
      flat: "",
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
    <View style={suggestStyles.wrap}>
      <Text style={fieldStyles.label}>{ADDRESS_DELIVERY_UI.LABEL_LINE}</Text>
      <TextInput
        style={[fieldStyles.input, fieldStyles.inputCompact]}
        value={value.line}
        onChangeText={handleLineChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        editable={!disabled}
        autoCorrect={false}
      />

      {suggestEnabled && suggestionsQuery.isPending ? (
        <ActivityIndicator style={suggestStyles.loader} color={theme.colors.action} />
      ) : null}

      {suggestEnabled && suggestions.length > 0 ? (
        <ScrollView
          style={suggestStyles.suggestions}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {suggestions.map((item, index) => (
            <Pressable
              key={`${item.value}-${index}`}
              style={suggestStyles.suggestionRow}
              onPress={() => handlePickSuggestion(item)}
            >
              <Text style={suggestStyles.suggestionText}>{item.value}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {suggestEnabled &&
      !suggestionsQuery.isPending &&
      activeQuery.length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH &&
      suggestions.length === 0 ? (
        <Text style={fieldStyles.hint}>{ADDRESS_DELIVERY_UI.NO_SUGGESTIONS}</Text>
      ) : null}
    </View>
  );
};
