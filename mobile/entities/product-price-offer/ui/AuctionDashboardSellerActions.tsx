import { Pressable, Text, View } from "react-native";

import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";

type AuctionDashboardSellerActionsProps = {
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
  acceptLabel: string;
  rejectLabel: string;
  pendingLabel: string;
};

export const AuctionDashboardSellerActions = ({
  onAccept,
  onReject,
  disabled = false,
  acceptLabel,
  rejectLabel,
  pendingLabel,
}: AuctionDashboardSellerActionsProps) => {
  const styles = useAuctionDashboardRowStyles();

  return (
    <View style={styles.decision} accessibilityRole="toolbar">
      <Pressable
        style={[styles.decisionBtn, styles.decisionBtnReject, disabled ? styles.disabled : null]}
        disabled={disabled}
        onPress={onReject}
      >
        <Text style={styles.decisionBtnTextReject}>{rejectLabel}</Text>
      </Pressable>
      <Pressable
        style={[styles.decisionBtn, styles.decisionBtnAccept, disabled ? styles.disabled : null]}
        disabled={disabled}
        onPress={onAccept}
      >
        <Text style={styles.decisionBtnTextAccept}>{disabled ? pendingLabel : acceptLabel}</Text>
      </Pressable>
    </View>
  );
};
