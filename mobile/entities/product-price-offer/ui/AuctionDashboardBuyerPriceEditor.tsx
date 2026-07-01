import { Pressable, Text, TextInput, View } from "react-native";

import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";

type AuctionDashboardBuyerPriceEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  disabled?: boolean;
  submitLabel: string;
  cancelLabel: string;
  pendingLabel: string;
};

export const AuctionDashboardBuyerPriceEditor = ({
  label,
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  submitLabel,
  cancelLabel,
  pendingLabel,
}: AuctionDashboardBuyerPriceEditorProps) => {
  const styles = useAuctionDashboardRowStyles();

  return (
    <View style={styles.editor}>
      <Text style={styles.editorLabel}>{label}</Text>
      <View style={styles.composer}>
        <Text style={styles.composerPrefix}>₽</Text>
        <TextInput
          style={[styles.composerInput, disabled ? styles.disabled : null]}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          keyboardType="number-pad"
          accessibilityLabel={label}
        />
        <Pressable
          style={[styles.composerSubmit, disabled ? styles.disabled : null]}
          disabled={disabled}
          onPress={onSubmit}
        >
          <Text style={styles.composerSubmitText}>{disabled ? pendingLabel : submitLabel}</Text>
        </Pressable>
      </View>
      <Pressable
        style={[styles.editorCancel, disabled ? styles.disabled : null]}
        disabled={disabled}
        onPress={onCancel}
      >
        <Text style={styles.editorCancelText}>{cancelLabel}</Text>
      </Pressable>
    </View>
  );
};
