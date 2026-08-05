import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { fetchAddressGeolocate } from "@/entities/address/api/fetchAddressGeolocate";
import {
  isAddressServiceUnavailable,
  resetAddressServiceUnavailable,
  subscribeAddressServiceAvailability,
} from "@/entities/address/api/addressServiceAvailability";
import { mapDadataSuggestion } from "@/entities/address/lib/mapDadataSuggestion";
import { resolveMapGeolocatePick } from "@/entities/address/lib/resolveMapGeolocatePick";
import { MapPointPicker } from "@/entities/maps/ui/MapPointPicker";
import { ADDRESS_DELIVERY_UI } from "@/shared/config";
import { textInputFocusScrollProps } from "@/shared/lib/scrollTextInputIntoViewOnFocus";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAddressSuggestStyles, useFormFieldStyles } from "@/shared/theme/formChromeStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import {
  ADDRESS_SUGGEST_DEBOUNCE_MS,
  ADDRESS_SUGGEST_MIN_QUERY_LENGTH,
} from "../model/constants";
import { useAddressSuggestionsQuery } from "../model/useAddressSuggestionsQuery";
import type { AddressSuggestionDto, RuDeliveryAddressValue } from "../model/types";

const MAP_GEOLOCATE_DEBOUNCE_MS = 350;

type AddressSuggestInputProps = {
  value: RuDeliveryAddressValue;
  onChange: (next: RuDeliveryAddressValue) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  showMap?: boolean;
};

export const AddressSuggestInput = ({
  value,
  onChange,
  disabled = false,
  placeholder,
  label,
  maxLength,
  containerStyle,
  labelStyle,
  inputStyle,
  showMap = true,
}: AddressSuggestInputProps) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const fieldStyles = useFormFieldStyles();
  const suggestStyles = useAddressSuggestStyles();
  const valueRef = useRef(value);
  valueRef.current = value;
  const geolocateSeqRef = useRef(0);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [serviceDown, setServiceDown] = useState(() => isAddressServiceUnavailable());
  const [mapStatus, setMapStatus] = useState<"idle" | "loading" | "error">("idle");
  const [mapError, setMapError] = useState<string | null>(null);

  const trimmedLine = value.line.trim();
  const suggestEnabled =
    trimmedLine.length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH &&
    !value.selectedFromSuggest &&
    !serviceDown;

  useEffect(() => {
    return subscribeAddressServiceAvailability(() => {
      setServiceDown(isAddressServiceUnavailable());
    });
  }, []);

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
    onChange({ ...valueRef.current, ...patchValue });
  };

  const handleLineChange = (text: string) => {
    setMapError(null);
    setMapStatus("idle");
    patch({
      line: text,
      selectedFromSuggest: false,
      fiasId: "",
      geo: null,
      regionCode: null,
      flat: "",
    });
  };

  const handleClearLine = () => {
    if (disabled) {
      return;
    }
    setMapError(null);
    setMapStatus("idle");
    setDebouncedQuery("");
    patch({
      line: "",
      selectedFromSuggest: false,
      fiasId: "",
      geo: null,
      regionCode: null,
      flat: "",
    });
  };

  const handlePickSuggestion = (suggestion: AddressSuggestionDto) => {
    const mapped = mapDadataSuggestion(suggestion);
    const isHouse = mapped.fiasId.length > 0;
    setMapError(null);
    setMapStatus("idle");
    patch({
      line: mapped.line,
      fiasId: mapped.fiasId,
      geo: mapped.geo,
      regionCode: mapped.regionCode,
      selectedFromSuggest: isHouse,
    });
    setDebouncedQuery(isHouse ? "" : mapped.line);
  };

  const handleMapPointChange = ({ lat, lon }: { lat: number; lon: number }) => {
    if (disabled) {
      return;
    }

    const seq = ++geolocateSeqRef.current;
    patch({
      geo: { lat, lon },
      selectedFromSuggest: false,
      fiasId: "",
      regionCode: null,
      flat: "",
    });
    setMapStatus("loading");
    setMapError(null);

    setTimeout(() => {
      if (seq !== geolocateSeqRef.current) {
        return;
      }

      void fetchAddressGeolocate({ lat, lon })
        .then((list) => {
          if (seq !== geolocateSeqRef.current) {
            return;
          }
          const pick = resolveMapGeolocatePick(list);
          if (!pick) {
            setMapStatus("error");
            setMapError(ADDRESS_DELIVERY_UI.MAP_GEOLOCATE_EMPTY);
            return;
          }
          const mapped = mapDadataSuggestion(pick.suggestion);
          setMapStatus(pick.isHouse ? "idle" : "error");
          setMapError(pick.isHouse ? null : ADDRESS_DELIVERY_UI.MAP_GEOLOCATE_NO_HOUSE);
          patch({
            line: mapped.line,
            fiasId: mapped.fiasId,
            geo: mapped.geo ?? { lat, lon },
            regionCode: mapped.regionCode,
            selectedFromSuggest: pick.isHouse,
          });
          setDebouncedQuery(pick.isHouse ? "" : mapped.line);
        })
        .catch((error: unknown) => {
          if (seq !== geolocateSeqRef.current) {
            return;
          }
          setMapStatus("error");
          setMapError(
            error instanceof Error && error.message
              ? error.message
              : ADDRESS_DELIVERY_UI.MAP_GEOLOCATE_ERROR,
          );
        });
    }, MAP_GEOLOCATE_DEBOUNCE_MS);
  };

  return (
    <View style={[suggestStyles.wrap, containerStyle]}>
      <Text style={[fieldStyles.labelStrong, labelStyle]}>
        {label ?? ADDRESS_DELIVERY_UI.LABEL_LINE}
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            fieldStyles.input,
            fieldStyles.inputCompact,
            inputStyle,
            value.line && !disabled ? styles.inputWithClear : null,
          ]}
          value={value.line}
          onChangeText={handleLineChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          editable={!disabled}
          autoCorrect={false}
          maxLength={maxLength}
          {...textInputFocusScrollProps}
        />
        {value.line && !disabled ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ADDRESS_DELIVERY_UI.CLEAR_LINE_ARIA}
            onPress={handleClearLine}
            hitSlop={8}
            style={styles.clearBtn}
          >
            <View
              style={[
                styles.clearBtnCircle,
                { backgroundColor: `${theme.colors.ink}14` },
              ]}
            >
              <Svg width={11} height={11} viewBox="0 0 12 12">
                <Path
                  d="M2.2 2.2l7.6 7.6M9.8 2.2L2.2 9.8"
                  stroke={theme.colors.textSecondary}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </View>
          </Pressable>
        ) : null}
      </View>

      {serviceDown ? (
        <View
          style={[
            styles.serviceBanner,
            {
              borderColor: `${theme.colors.action}47`,
              backgroundColor: theme.colors.actionSoft,
            },
          ]}
        >
          <Text style={[styles.serviceBannerText, { color: theme.colors.textSecondary }]}>
            {ADDRESS_DELIVERY_UI.SERVICE_UNAVAILABLE}
          </Text>
          <Pressable
            disabled={disabled}
            onPress={() => {
              resetAddressServiceUnavailable();
              setServiceDown(false);
            }}
            style={[
              styles.serviceRetry,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                opacity: disabled ? 0.6 : 1,
              },
            ]}
          >
            <Text style={{ color: theme.colors.action, fontWeight: "600", fontSize: 13 }}>
              {ADDRESS_DELIVERY_UI.SERVICE_RETRY}
            </Text>
          </Pressable>
        </View>
      ) : null}

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

      {showMap ? (
        <View style={styles.mapBlock}>
          <Text style={fieldStyles.hint}>{ADDRESS_DELIVERY_UI.MAP_PICK_HINT}</Text>
          <Pressable
            disabled={disabled}
            onPress={() => setMapOpen(true)}
            style={{
              alignSelf: "flex-start",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 10,
              backgroundColor: theme.colors.actionSoft,
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <Text style={{ color: theme.colors.action, fontWeight: "600", fontSize: 14 }}>
              {ADDRESS_DELIVERY_UI.MAP_OPEN}
            </Text>
          </Pressable>
          {mapStatus === "loading" ? (
            <Text style={fieldStyles.hint}>{ADDRESS_DELIVERY_UI.MAP_GEOLOCATE_LOADING}</Text>
          ) : null}
          {mapError ? (
            <Text style={[fieldStyles.hint, { color: theme.colors.danger }]}>{mapError}</Text>
          ) : null}
        </View>
      ) : null}

      <Modal
        visible={mapOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setMapOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#e8f0ea" }}>
          <MapPointPicker
            lat={value.geo?.lat ?? null}
            lon={value.geo?.lon ?? null}
            disabled={disabled}
            fill
            onPointChange={handleMapPointChange}
          />

          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              gap: 8,
              paddingHorizontal: 16,
              paddingTop: 24,
              paddingBottom: Math.max(insets.bottom, 16),
            }}
          >
            {mapStatus === "loading" ? (
              <Text style={[fieldStyles.hint, styles.overlayHint]}>
                {ADDRESS_DELIVERY_UI.MAP_GEOLOCATE_LOADING}
              </Text>
            ) : null}
            {mapError ? (
              <Text style={[fieldStyles.hint, styles.overlayCard, { color: theme.colors.danger }]}>
                {mapError}
              </Text>
            ) : null}
            {value.line ? (
              <Text style={[styles.overlayCard, { color: theme.colors.ink }]} numberOfLines={2}>
                {value.line}
              </Text>
            ) : null}
            <Pressable
              onPress={() => setMapOpen(false)}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: theme.colors.action,
                alignItems: "center",
                shadowColor: theme.colors.action,
                shadowOpacity: 0.35,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Text style={{ color: theme.colors.onContrast, fontWeight: "700", fontSize: 16 }}>
                {ADDRESS_DELIVERY_UI.MAP_DONE}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputRow: {
    position: "relative",
    width: "100%",
  },
  inputWithClear: {
    paddingRight: 38,
  },
  clearBtn: {
    position: "absolute",
    right: 8,
    top: 0,
    bottom: 0,
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  mapBlock: {
    gap: 6,
    marginTop: 8,
  },
  serviceBanner: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
  },
  serviceBannerText: {
    flex: 1,
    minWidth: 160,
    fontSize: 13,
    lineHeight: 17,
  },
  serviceRetry: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  overlayHint: {
    paddingHorizontal: 4,
    textShadowColor: "rgba(255,255,255,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  overlayCard: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.94)",
    fontSize: 14,
    lineHeight: 18,
    overflow: "hidden",
  },
});
