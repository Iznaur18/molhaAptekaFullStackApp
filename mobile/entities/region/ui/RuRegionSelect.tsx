import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { getRuRegionByCode } from "@molha/api-contract";

import { RuRegionPickerSheet } from "./RuRegionPickerSheet";
import { REGION_UI } from "@/shared/config";
import { useCategoryPickerSheetStyles } from "@/shared/theme/categoryPickerSheetStyles";

type RuRegionSelectProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
};

export function RuRegionSelect({
  value,
  onChange,
  disabled = false,
  label = REGION_UI.LABEL,
  required = false,
}: RuRegionSelectProps) {
  const sheetStyles = useCategoryPickerSheetStyles();
  const [open, setOpen] = useState(false);

  const selectedLabel = getRuRegionByCode(value)?.name ?? "";

  const openSheet = () => {
    if (disabled) return;
    setOpen(true);
  };

  return (
    <>
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

      <RuRegionPickerSheet
        open={open}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={(code) => {
          onChange(code);
          setOpen(false);
        }}
      />
    </>
  );
}
