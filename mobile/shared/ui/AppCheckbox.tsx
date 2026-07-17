import { Feather } from "@expo/vector-icons";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { useAppCheckboxStyles } from "@/shared/theme/appCheckboxStyles";

const CHECKBOX_HIT_SLOP = 10;
const CHECK_ICON_SIZE = 15;

type CheckboxBoxProps = {
  checked: boolean;
  /** Выбрана часть вложенных пунктов: показываем прочерк вместо галочки. */
  indeterminate?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Визуал чекбокса без обработки нажатия — для строк, которые нажимаются целиком. */
export const CheckboxBox = ({
  checked,
  indeterminate = false,
  disabled = false,
  style,
}: CheckboxBoxProps) => {
  const styles = useAppCheckboxStyles();
  const isFilled = checked || indeterminate;

  return (
    <View
      style={[styles.box, isFilled && styles.boxChecked, disabled && styles.boxDisabled, style]}
    >
      {isFilled ? (
        <Feather
          name={indeterminate ? "minus" : "check"}
          size={CHECK_ICON_SIZE}
          color={styles.checkIcon.color}
        />
      ) : null}
    </View>
  );
};

type AppCheckboxProps = CheckboxBoxProps & {
  onPress: () => void;
  accessibilityLabel: string;
};

export const AppCheckbox = ({
  checked,
  indeterminate = false,
  onPress,
  accessibilityLabel,
  disabled = false,
  style,
}: AppCheckboxProps) => (
  <Pressable
    style={style}
    hitSlop={CHECKBOX_HIT_SLOP}
    disabled={disabled}
    onPress={onPress}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: indeterminate ? "mixed" : checked, disabled }}
    accessibilityLabel={accessibilityLabel}
  >
    <CheckboxBox checked={checked} indeterminate={indeterminate} disabled={disabled} />
  </Pressable>
);
