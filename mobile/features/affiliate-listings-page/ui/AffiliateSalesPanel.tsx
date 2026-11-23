import { Text, View } from "react-native";

import { useMyAffiliateSalesQuery } from "@/entities/user/model/useMyAffiliateSalesQuery";
import { AffiliateDealCard } from "@/features/affiliate-listings-page/ui/AffiliateDealCard";
import { AFFILIATE_SALES_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type AffiliateSalesPanelProps = {
  enabled?: boolean;
};

export const AffiliateSalesPanel = ({ enabled = true }: AffiliateSalesPanelProps) => {
  const theme = useAppTheme();
  const salesQuery = useMyAffiliateSalesQuery({ enabled });

  if (!enabled) {
    return null;
  }

  if (salesQuery.isLoading) {
    return <ScreenLoadingState message={AFFILIATE_SALES_UI.LOADING} />;
  }

  if (salesQuery.isError) {
    return (
      <ScreenErrorState
        message={
          salesQuery.error instanceof Error
            ? salesQuery.error.message
            : AFFILIATE_SALES_UI.LOAD_ERROR
        }
        onRetry={() => void salesQuery.refetch()}
      />
    );
  }

  const rows = salesQuery.data?.rows ?? [];

  return (
    <View
      style={{
        gap: 12,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
      accessibilityLabel={AFFILIATE_SALES_UI.TITLE}
    >
      <Text style={{ fontSize: 17, fontWeight: "700", color: theme.colors.text }}>
        {AFFILIATE_SALES_UI.TITLE}
      </Text>
      <Text style={{ fontSize: 13, lineHeight: 19, color: theme.colors.textMuted }}>
        {AFFILIATE_SALES_UI.HINT}
      </Text>
      {rows.length === 0 ? (
        <Text style={{ fontSize: 13, color: theme.colors.textMuted }}>
          {AFFILIATE_SALES_UI.EMPTY}
        </Text>
      ) : (
        rows.map((row) => (
          <AffiliateDealCard
            key={`${row.orderId}-${row.orderItemId}`}
            title={row.productName}
            status={row.status}
            statusLabel={
              row.status in AFFILIATE_SALES_UI.STATUS
                ? AFFILIATE_SALES_UI.STATUS[
                    row.status as keyof typeof AFFILIATE_SALES_UI.STATUS
                  ]
                : row.status
            }
            facts={[
              {
                label: AFFILIATE_SALES_UI.PARTNER,
                value: row.partnerName || AFFILIATE_SALES_UI.NAME_FALLBACK,
              },
              {
                label: AFFILIATE_SALES_UI.BUYER,
                value: row.buyerName || AFFILIATE_SALES_UI.NAME_FALLBACK,
              },
              ...(row.status === "paid"
                ? [
                    {
                      label: AFFILIATE_SALES_UI.AMOUNT,
                      value: String(row.amount),
                      accent: true,
                    },
                    {
                      label: AFFILIATE_SALES_UI.PERCENT,
                      value:
                        row.percentUsed == null
                          ? AFFILIATE_SALES_UI.NAME_FALLBACK
                          : `${row.percentUsed}%`,
                    },
                  ]
                : []),
            ]}
            dateLabel={`${AFFILIATE_SALES_UI.DATE} ${
              row.createdAt
                ? new Date(row.createdAt).toLocaleDateString("ru-RU")
                : AFFILIATE_SALES_UI.NAME_FALLBACK
            }`}
          />
        ))
      )}
    </View>
  );
};