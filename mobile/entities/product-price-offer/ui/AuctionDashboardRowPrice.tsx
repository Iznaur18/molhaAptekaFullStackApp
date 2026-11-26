import { Text, View } from "react-native";

import { formatPriceRub } from "@/shared/lib";
import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";

type AuctionDashboardRowPriceProps = {
  price: number | null | undefined;
  caption: string;
};

/** Паритет web `AuctionDashboardRowPrice` — цена справа в шапке карточки. */
export const AuctionDashboardRowPrice = ({
  price,
  caption,
}: AuctionDashboardRowPriceProps) => {
  const styles = useAuctionDashboardRowStyles();

  return (
    <View style={styles.priceBox}>
      <Text style={styles.priceBoxValue}>{formatPriceRub(price)}</Text>
      <Text style={styles.priceBoxCaption}>{caption}</Text>
    </View>
  );
};
