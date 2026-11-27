import { Text, View } from "react-native";

import { useAffiliateListingsPageStyles } from "@/shared/theme/affiliateListingsPageStyles";

const STATUS_TONE: Record<string, "paid" | "pending" | "skipped"> = {
  paid: "paid",
  pending: "pending",
  skipped_no_program: "skipped",
  skipped_antifraud: "skipped",
};

type AffiliateDealFact = {
  label: string;
  value: string;
  accent?: boolean;
};

type AffiliateDealCardProps = {
  title: string;
  status?: string;
  statusLabel?: string;
  facts: readonly AffiliateDealFact[];
  dateLabel: string;
};

/** web `.affiliate-listings-page__deal` */
export const AffiliateDealCard = ({
  title,
  status,
  statusLabel,
  facts,
  dateLabel,
}: AffiliateDealCardProps) => {
  const styles = useAffiliateListingsPageStyles();
  const tone = status ? STATUS_TONE[status] : undefined;

  return (
    <View style={styles.deal}>
      <View style={styles.dealHead}>
        <Text style={styles.dealTitle} numberOfLines={2}>
          {title}
        </Text>
        {statusLabel ? (
          <Text
            style={[
              styles.dealStatus,
              tone === "paid" ? styles.dealStatusPaid : null,
              tone === "pending" ? styles.dealStatusPending : null,
              tone === "skipped" ? styles.dealStatusSkipped : null,
            ]}
          >
            {statusLabel}
          </Text>
        ) : null}
      </View>
      <View style={styles.dealFacts}>
        {facts.map((fact) => (
          <View key={fact.label} style={styles.dealFact}>
            <Text style={styles.dealFactLabel}>{fact.label}</Text>
            <Text
              style={[
                styles.dealFactValue,
                fact.accent ? styles.dealFactValueAccent : null,
              ]}
              numberOfLines={1}
            >
              {fact.value}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.dealDate}>{dateLabel}</Text>
    </View>
  );
};
