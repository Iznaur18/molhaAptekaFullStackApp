import { Pressable, Text, View } from "react-native";

import { CATEGORY_TREE_ADMIN_PAGE_UI } from "@/shared/config";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";

type CategoryTreeParentPickerProps = {
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const CategoryTreeParentPicker = ({
  value,
  options,
  onChange,
  disabled = false,
}: CategoryTreeParentPickerProps) => {
  const styles = useAdminPanelStyles();

  return (
    <View style={styles.pickerWrap}>
      <Pressable
        style={[styles.pickerChip, value === "" && styles.pickerChipSelected]}
        disabled={disabled}
        onPress={() => onChange("")}
      >
        <Text style={styles.pickerChipText}>{CATEGORY_TREE_ADMIN_PAGE_UI.PARENT_ROOT}</Text>
      </Pressable>
      {options.map((option) => (
        <Pressable
          key={option.id}
          style={[styles.pickerChip, value === option.id && styles.pickerChipSelected]}
          disabled={disabled}
          onPress={() => onChange(option.id)}
        >
          <Text style={styles.pickerChipText} numberOfLines={1}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
