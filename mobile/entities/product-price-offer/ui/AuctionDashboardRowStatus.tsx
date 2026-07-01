import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";

type AuctionDashboardRowStatusProps = {
  isPending?: boolean;
  isAccepted?: boolean;
  children: ReactNode;
};

export const AuctionDashboardRowStatus = ({
  isPending = false,
  isAccepted = false,
  children,
}: AuctionDashboardRowStatusProps) => {
  const styles = useAuctionDashboardRowStyles();

  if (!children) {
    return null;
  }

  return (
    <View
      style={[
        styles.statusPill,
        isPending ? styles.statusPillPending : null,
        isAccepted ? styles.statusPillAccepted : null,
      ]}
    >
      <Text
        style={[
          styles.statusPillText,
          isPending ? styles.statusPillTextPending : null,
          isAccepted ? styles.statusPillTextAccepted : null,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};
