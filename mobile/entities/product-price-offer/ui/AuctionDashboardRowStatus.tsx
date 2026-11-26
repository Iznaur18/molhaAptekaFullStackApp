import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";

export type AuctionDashboardRowStatusTone = "neutral" | "attention" | "success";

type AuctionDashboardRowStatusProps = {
  tone?: AuctionDashboardRowStatusTone;
  /** @deprecated используйте tone */
  isPending?: boolean;
  /** @deprecated используйте tone */
  isAccepted?: boolean;
  children: ReactNode;
};

/** Паритет web `AuctionDashboardRowStatus` (tone: neutral | attention | success). */
export const AuctionDashboardRowStatus = ({
  tone,
  isPending = false,
  isAccepted = false,
  children,
}: AuctionDashboardRowStatusProps) => {
  const styles = useAuctionDashboardRowStyles();

  if (!children) {
    return null;
  }

  const resolvedTone: AuctionDashboardRowStatusTone =
    tone ?? (isAccepted ? "success" : isPending ? "attention" : "neutral");

  return (
    <View
      style={[
        styles.statusPill,
        resolvedTone === "neutral" ? styles.statusPillNeutral : null,
        resolvedTone === "attention" ? styles.statusPillAttention : null,
        resolvedTone === "success" ? styles.statusPillSuccess : null,
      ]}
    >
      <Text
        style={[
          styles.statusPillText,
          resolvedTone === "neutral" ? styles.statusPillTextNeutral : null,
          resolvedTone === "attention" ? styles.statusPillTextAttention : null,
          resolvedTone === "success" ? styles.statusPillTextSuccess : null,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};
