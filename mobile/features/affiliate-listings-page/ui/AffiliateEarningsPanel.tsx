import { useQuery } from "@tanstack/react-query";
import { Pressable, Text, View } from "react-native";

import { fetchMyAffiliateEarnings } from "@/entities/user/api/affiliateProgram";
import { AFFILIATE_LISTINGS_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type AffiliateEarningsPanelProps = {
  enabled?: boolean;
};

export const AffiliateEarningsPanel = ({ enabled = true }: AffiliateEarningsPanelProps) => {
  const theme = useAppTheme();

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
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 12,
        padding: 14,
        gap: 8,
        backgroundColor: theme.colors.surface,
      }}
      accessibilityLabel={AFFILIATE_LISTINGS_PAGE_UI.ARIA}
    >
      <Text style={{ fontSize: 17, fontWeight: "700", color: theme.colors.text }}>
        {AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_TITLE}
      </Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
        {AFFILIATE_LISTINGS_PAGE_UI.SELLER_PAYOUT_HINT}
      </Text>
      <Text style={{ color: theme.colors.textMuted }}>
        {AFFILIATE_LISTINGS_PAGE_UI.LOYALTY_BALANCE}:{" "}
        {earnings?.loyaltyPointsBalance ?? 0}
      </Text>
      {(earnings?.rows?.length ?? 0) === 0 ? (
        <Text style={{ color: theme.colors.textMuted }}>
          {AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_EMPTY}
        </Text>
      ) : (
        earnings?.rows.map((row, index) => (
          <Pressable
            key={row.sourceId ?? `${row.orderId}-${row.paidAt}-${index}`}
            style={{
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
              gap: 4,
            }}
          >
            {row.productName ? (
              <Text style={{ color: theme.colors.text, fontWeight: "600" }}>
                {row.productName}
              </Text>
            ) : null}
            <Text style={{ color: theme.colors.text }}>
              {AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_AMOUNT}: {row.amount}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
              {AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_PERCENT}: {row.percentUsed ?? "—"}%
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
              {AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_DATE}:{" "}
              {row.paidAt ? new Date(row.paidAt).toLocaleString("ru-RU") : "—"}
            </Text>
          </Pressable>
        ))
      )}
    </View>
  );
};
