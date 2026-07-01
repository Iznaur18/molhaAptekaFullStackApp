import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useAuctionPageStyles } from "@/shared/theme/auctionPageStyles";

type AuctionPageSectionProps = {
  title: string;
  count: number;
  children?: ReactNode;
};

export const AuctionPageSection = ({ title, count, children }: AuctionPageSectionProps) => {
  const styles = useAuctionPageStyles();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>
      {children}
    </View>
  );
};
