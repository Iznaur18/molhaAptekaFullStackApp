import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ProfileRow } from "@/entities/user/lib/getUserProfileRows";
import {
  groupProfileRows,
  isBooleanProfileRow,
} from "@/entities/user/lib/groupProfileRows";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type UserProfileInfoPanelProps = {
  rows: ProfileRow[];
};

export const UserProfileInfoPanel = ({ rows }: UserProfileInfoPanelProps) => {
  const theme = useAppTheme();
  const sections = useMemo(() => groupProfileRows(rows), [rows]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <View style={styles.root}>
      {sections.map((section) => (
        <View key={section.id} style={styles.section}>
          {section.title ? (
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {section.title}
            </Text>
          ) : null}

          {section.id === "stats" ? (
            <View style={styles.statsGrid}>
              {section.rows.map((row) => (
                <View
                  key={row.id}
                  style={[styles.statCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                >
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{row.value}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{row.label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.detailsCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              {section.rows.map((row, index) => (
                <View
                  key={row.id}
                  style={[
                    styles.detailRow,
                    index < section.rows.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>
                    {row.label}
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.colors.text },
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

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statCard: {
    width: "48%",
    minWidth: 140,
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
  },
  detailsCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    overflow: "hidden",
  },
  detailRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 15,
    lineHeight: 21,
  },
  detailValuePositive: {
    color: "#2e7d32",
    fontWeight: "600",
  },
  detailValueMuted: {
    color: "#888",
  },
});
