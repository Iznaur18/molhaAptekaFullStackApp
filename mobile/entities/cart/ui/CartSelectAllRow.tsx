import { Pressable, Text, View } from "react-native";

import { CART_PAGE_UI } from "@/shared/config";
import { useCartSelectAllRowStyles } from "@/shared/theme/commerceScreenStyles";
import { CheckboxBox } from "@/shared/ui/AppCheckbox";

const SELECT_ALL_HIT_SLOP = 8;

type CartSelectAllRowProps = {
  selectedCount: number;
  totalCount: number;
  areAllSelected: boolean;
  onToggleAll: () => void;
};

export const CartSelectAllRow = ({
  selectedCount,
  totalCount,
  areAllSelected,
  onToggleAll,
}: CartSelectAllRowProps) => {
  const styles = useCartSelectAllRowStyles();
  const isIndeterminate = !areAllSelected && selectedCount > 0;

  return (
    <View style={styles.row}>
      <Text style={styles.count}>{CART_PAGE_UI.SELECTED_COUNT(selectedCount, totalCount)}</Text>

      <Pressable
        style={styles.toggle}
        hitSlop={SELECT_ALL_HIT_SLOP}
        onPress={onToggleAll}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isIndeterminate ? "mixed" : areAllSelected }}
        accessibilityLabel={CART_PAGE_UI.SELECT_ALL}
      >
        <Text style={styles.toggleLabel}>{CART_PAGE_UI.SELECT_ALL}</Text>
        <CheckboxBox checked={areAllSelected} indeterminate={isIndeterminate} />
      </Pressable>
    </View>
  );
};
