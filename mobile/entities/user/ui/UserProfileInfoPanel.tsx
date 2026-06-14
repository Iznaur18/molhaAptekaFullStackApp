import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ProfileRow } from "@/entities/user/lib/getUserProfileRows";
import {
  groupProfileRows,
  isBooleanProfileRow,
} from "@/entities/user/lib/groupProfileRows";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

type UserProfileInfoPanelProps = {
  rows: ProfileRow[];
};

const useStyles = createThemedStyles((theme) => ({
  root: {
    gap: theme.spacing[4],
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  statCard: {
    width: "48%",
    minWidth: 140,
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.button,
    padding: theme.spacing[3],
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  statLabel: {
    marginTop: theme.spacing[1],
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  detailsCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.button,
    overflow: "hidden",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  detailRow: {
    paddingHorizontal: 14,
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[1],
  },
  detailRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  detailValue: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.colors.text,
  },
  detailValuePositive: {
    color: theme.colors.success,
    fontWeight: "600",
  },
  detailValueMuted: {
    color: theme.colors.textMuted,
  },
}));

export const UserProfileInfoPanel = ({ rows }: UserProfileInfoPanelProps) => {
  const styles = useStyles();
  const sections = useMemo(() => groupProfileRows(rows), [rows]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <View style={styles.root}>
      {sections.map((section) => (
        <View key={section.id} style={styles.section}>
          {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}

          {section.id === "stats" ? (
            <View style={styles.statsGrid}>
              {section.rows.map((row) => (
                <View key={row.id} style={styles.statCard}>
                  <Text style={styles.statValue}>{row.value}</Text>
                  <Text style={styles.statLabel}>{row.label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.detailsCard}>
              {section.rows.map((row, index) => (
                <View
                  key={row.id}
                  style={[
                    styles.detailRow,
                    index < section.rows.length - 1 && styles.detailRowDivider,
                  ]}
                >
                  <Text style={styles.detailLabel}>{row.label}</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      isBooleanProfileRow(row.id) && row.value === "Да" && styles.detailValuePositive,
                      isBooleanProfileRow(row.id) && row.value === "Нет" && styles.detailValueMuted,
                    ]}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};
