import { Pressable, Text, TextInput, View } from "react-native";

import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";

type AuctionDashboardBuyerPriceEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  disabled?: boolean;
  submitLabel: string;
  closeLabel: string;
  pendingLabel: string;
};

/** Паритет web `AuctionDashboardBuyerPriceEditor` — composer + «Не менять». */
export const AuctionDashboardBuyerPriceEditor = ({
  label,
  value,
  onChange,
  onSubmit,
  onClose,
  disabled = false,
  submitLabel,
  closeLabel,
  pendingLabel,
}: AuctionDashboardBuyerPriceEditorProps) => {
  const styles = useAuctionDashboardRowStyles();

  return (
    <View style={styles.editor}>
      <View style={styles.composer}>
        <Text style={styles.composerPrefix} accessibilityElementsHidden>
          ₽
        </Text>
        <TextInput
          style={[styles.composerInput, disabled ? styles.disabled : null]}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          keyboardType="number-pad"
          accessibilityLabel={label}
          autoFocus
        />
        <Pressable
          style={[styles.composerSubmit, disabled ? styles.disabled : null]}
          disabled={disabled}
          onPress={onSubmit}
        >
          <Text style={styles.composerSubmitText}>
            {disabled ? pendingLabel : submitLabel}
          </Text>
        </Pressable>
      </View>
      <Pressable
        style={[styles.textBtn, disabled ? styles.disabled : null]}
        disabled={disabled}
        onPress={onClose}
      >
        <Text style={styles.textBtnLabel}>{closeLabel}</Text>
      </Pressable>
    </View>
  );
};
