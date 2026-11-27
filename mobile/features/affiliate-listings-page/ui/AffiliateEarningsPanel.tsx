import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

import { fetchMyAffiliateEarnings } from "@/entities/user/api/affiliateProgram";
import { AffiliateDealCard } from "@/features/affiliate-listings-page/ui/AffiliateDealCard";
import { AFFILIATE_LISTINGS_PAGE_UI, AFFILIATE_SALES_UI } from "@/shared/config";
import { useAffiliateListingsPageStyles } from "@/shared/theme/affiliateListingsPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type AffiliateEarningsPanelProps = {
  enabled?: boolean;
};

export const AffiliateEarningsPanel = ({
  enabled = true,
}: AffiliateEarningsPanelProps) => {
  const styles = useAffiliateListingsPageStyles();

  const earningsQuery = useQuery({
    queryKey: ["user", "me", "affiliate-earnings"],
    queryFn: fetchMyAffiliateEarnings,
    enabled,
  });

  if (!enabled) {
    return null;
  }

  if (earningsQuery.isLoading) {
    return <ScreenLoadingState message={AFFILIATE_LISTINGS_PAGE_UI.LOADING} />;
  }

  if (earningsQuery.isError) {
    return (
      <ScreenErrorState
        message={
          earningsQuery.error instanceof Error
            ? earningsQuery.error.message
            : AFFILIATE_LISTINGS_PAGE_UI.LOAD_ERROR
        }
      />
    );
  }

  const earnings = earningsQuery.data;

  return (
    <View style={styles.card} accessibilityLabel={AFFILIATE_LISTINGS_PAGE_UI.ARIA}>
      <Text style={styles.title}>{AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_TITLE}</Text>
      <Text style={styles.hint}>{AFFILIATE_LISTINGS_PAGE_UI.SELLER_PAYOUT_HINT}</Text>
      <Text style={styles.meta}>
        {AFFILIATE_LISTINGS_PAGE_UI.LOYALTY_BALANCE}:{" "}
        {earnings?.loyaltyPointsBalance ?? 0}
      </Text>
      {(earnings?.rows?.length ?? 0) === 0 ? (
        <Text style={styles.empty}>{AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_EMPTY}</Text>
      ) : (
        <View style={styles.list}>
          {earnings?.rows.map((row, index) => (
            <AffiliateDealCard
              key={row.sourceId ?? `${row.orderId}-${row.paidAt}-${index}`}
              title={row.productName || AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_PRODUCT}
              status="paid"
              statusLabel={AFFILIATE_SALES_UI.STATUS.paid}
              facts={[
                {
                  label: AFFILIATE_SALES_UI.SELLER,
                  value: row.sellerName || AFFILIATE_SALES_UI.NAME_FALLBACK,
                },
                {
                  label: AFFILIATE_SALES_UI.BUYER,
                  value: row.buyerName || AFFILIATE_SALES_UI.NAME_FALLBACK,
                },
                {
                  label: AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_AMOUNT,
                  value: String(row.amount),
                  accent: true,
                },
                {
                  label: AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_PERCENT,
                  value:
                    row.percentUsed == null
                      ? AFFILIATE_SALES_UI.NAME_FALLBACK
                      : `${row.percentUsed}%`,
                },
              ]}
              dateLabel={
                row.paidAt
                  ? new Date(row.paidAt).toLocaleString("ru-RU")
                  : AFFILIATE_SALES_UI.NAME_FALLBACK
              }
            />
          ))}
        </View>
      )}
    </View>
  );
};
