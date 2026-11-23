import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/theme/AppThemeProvider";

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

export const AffiliateDealCard = ({
  title,
  status,
  statusLabel,
  facts,
  dateLabel,
}: AffiliateDealCardProps) => {
  const theme = useAppTheme();
  const tone = status ? STATUS_TONE[status] : undefined;

  const statusColors =
    tone === "paid"
      ? { bg: "rgba(34, 197, 94, 0.12)", text: theme.colors.success }
      : tone === "pending"
        ? { bg: "rgba(234, 179, 8, 0.14)", text: theme.colors.warning }
        : tone === "skipped"
          ? { bg: theme.colors.surfaceMuted, text: theme.colors.textMuted }
          : { bg: theme.colors.surfaceMuted, text: theme.colors.textSecondary };

  return (
    <View
      style={{
        gap: 8,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 15,
            fontWeight: "600",
            color: theme.colors.text,
          }}
        >
          {title}
        </Text>
        {statusLabel ? (
          <Text
            style={{
              flexShrink: 0,
              fontSize: 12,
              fontWeight: "600",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              overflow: "hidden",
              color: statusColors.text,
              backgroundColor: statusColors.bg,
            }}
          >
            {statusLabel}
          </Text>
        ) : null}
      </View>
      {facts.map((fact) => (
        <View
          key={fact.label}
          style={{ flexDirection: "row", gap: 8, alignItems: "baseline" }}
        >
          <Text
            style={{
              width: 112,
              flexShrink: 0,
              fontSize: 13,
              color: theme.colors.textMuted,
            }}
          >
            {fact.label}
          </Text>
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              color: fact.accent ? theme.colors.link : theme.colors.text,
              fontWeight: fact.accent ? "600" : "400",
            }}
          >
            {fact.value}
          </Text>
        </View>
      ))}
      <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>{dateLabel}</Text>
    </View>
  );
};