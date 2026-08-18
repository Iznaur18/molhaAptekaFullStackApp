import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getRuRegionByCode } from "@molha/api-contract";

import { filterRuRegionsByQuery } from "@/entities/region/lib/filterRuRegionsByQuery";
import { REGION_UI } from "@/shared/config";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
import { useCategoryPickerSheetStyles } from "@/shared/theme/categoryPickerSheetStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

type RuRegionSelectProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  compact?: boolean;
};

const useRegionSelectStyles = createThemedStyles((theme) => ({
  compactRoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    minWidth: 0,
  },
  compactLabel: {
    flexShrink: 0,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  compactBox: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceMuted,
  },
  compactValue: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
  },
  optionSelected: {
    backgroundColor: theme.colors.actionSurface,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingBottom: theme.spacing[8],
  },
  row: {
    paddingHorizontal: 16,
  },
}));

export function RuRegionSelect({
  value,
  onChange,
  disabled = false,
  label = REGION_UI.LABEL,
  required = false,
  compact = false,
}: RuRegionSelectProps) {
  const sheetStyles = useCategoryPickerSheetStyles();
  const styles = useRegionSelectStyles();
  const [open, setOpen] = useState(false);
  useRegisterBlockingOverlay(open);
  const [query, setQuery] = useState("");

  const selectedLabel = getRuRegionByCode(value)?.name ?? "";

  const filtered = useMemo(
    () => filterRuRegionsByQuery(query, undefined, value),
    [query, value],
  );

  const openSheet = () => {
    if (disabled) return;
    setQuery("");
    setOpen(true);
  };

  const pick = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <>
      {compact ? (
        <View style={styles.compactRoot}>
          {label ? <Text style={styles.compactLabel}>{label}</Text> : null}
          <Pressable
            style={styles.compactBox}
            disabled={disabled}
            onPress={openSheet}
            accessibilityRole="button"
            accessibilityLabel={REGION_UI.VIEWER_ARIA}
          >
            <Text style={styles.compactValue} numberOfLines={1}>
              {selectedLabel || REGION_UI.PLACEHOLDER}
            </Text>
            <Text style={sheetStyles.fieldChevron}>›</Text>
          </Pressable>
        </View>
      ) : (
        <View style={sheetStyles.fieldWrap}>
          <Text style={sheetStyles.fieldLabel}>
            {label}
            {required ? " *" : ""}
          </Text>
          <Pressable
            style={sheetStyles.fieldBox}
            disabled={disabled}
            onPress={openSheet}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Text
              style={[
                sheetStyles.fieldValue,
                !selectedLabel && sheetStyles.fieldPlaceholder,
              ]}
              numberOfLines={2}
            >
              {selectedLabel || REGION_UI.PLACEHOLDER}
            </Text>
            <Text style={sheetStyles.fieldChevron}>›</Text>
          </Pressable>
        </View>
      )}

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={sheetStyles.sheetRoot} edges={["top", "bottom"]}>
          <View style={sheetStyles.sheetHeader}>
            <Text style={sheetStyles.sheetTitle}>{REGION_UI.SHEET_TITLE}</Text>
            <Pressable onPress={() => setOpen(false)}>
              <Text style={sheetStyles.sheetClose}>{REGION_UI.SHEET_CLOSE}</Text>
            </Pressable>
          </View>
          <View style={sheetStyles.searchWrap}>
            <TextInput
              style={sheetStyles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={REGION_UI.SEARCH_PLACEHOLDER}
              placeholderTextColor={sheetStyles.fieldPlaceholder.color}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            style={sheetStyles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const selected = item.code === value;
              return (
                <Pressable
                  style={[
                    sheetStyles.row,
                    styles.row,
                    selected && styles.optionSelected,
                  ]}
                  onPress={() => pick(item.code)}
                >
                  <Text style={sheetStyles.rowLabel}>{item.name}</Text>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={sheetStyles.statusText}>{REGION_UI.SEARCH_EMPTY}</Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}
