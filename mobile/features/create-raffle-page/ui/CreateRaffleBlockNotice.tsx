import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { CREATE_RAFFLE_MODAL_UI } from "@/shared/config";
import { useCreateRafflePageStyles } from "@/shared/theme/createRafflePageStyles";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type CreateRaffleBlockNoticeProps = {
  message: string;
  canWithdraw: boolean;
  isWithdrawing?: boolean;
  onWithdraw?: () => void;
};

export const CreateRaffleBlockNotice = ({
  message,
  canWithdraw,
  isWithdrawing = false,
  onWithdraw,
}: CreateRaffleBlockNoticeProps) => {
  const styles = useCreateRafflePageStyles();
  const theme = useAppTheme();

  return (
    <View style={styles.blockNotice} accessibilityRole="alert">
      <Text style={styles.blockNoticeText}>{message}</Text>
      {canWithdraw && onWithdraw ? (
        <Pressable
          style={[styles.blockNoticeBtn, isWithdrawing && styles.submitDisabled]}
          onPress={onWithdraw}
          disabled={isWithdrawing}
          accessibilityRole="button"
          accessibilityLabel={CREATE_RAFFLE_MODAL_UI.BTN_WITHDRAW}
        >
          {isWithdrawing ? (
            <ActivityIndicator color={theme.colors.onContrast} />
          ) : (
            <Text style={styles.blockNoticeBtnText}>{CREATE_RAFFLE_MODAL_UI.BTN_WITHDRAW}</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
};
