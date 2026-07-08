import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ProfileRow } from "@/entities/user/lib/getUserProfileRows";
import {
  groupProfileRows,
  isBooleanProfileRow,
} from "@/entities/user/lib/groupProfileRows";
import { getProfileRowIcon } from "@/entities/user/lib/profileRowIcons";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { semanticColors } from "@/shared/theme/semanticColors";

type UserProfileInfoPanelProps = {
  rows: ProfileRow[];
};

const PROFILE_INFO_PALETTE = {
  bg: semanticColors.surface,
  border: semanticColors.border,
  color: semanticColors.textSecondary,
  iconBg: semanticColors.surfaceMuted,
} as const;

const useStyles = createThemedStyles((theme) => ({
  root: {
    gap: theme.spacing[4],
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48%",
    minWidth: 130,
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  statHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
    paddingLeft: 36,
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailsCard: {
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 12,
    rowGap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  detailIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "right",
    flexShrink: 0,
    marginLeft: "auto",
  },
  detailValuePositive: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  detailValueMuted: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
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
      {sections.map((section, sectionIndex) => {
        const { bg, border, color, iconBg } = PROFILE_INFO_PALETTE;
        if (section.id === "stats") {
          return (
            <View key={section.id} style={styles.statsGrid}>
              {section.rows.map((row, rowIndex) => {
                const icon = getProfileRowIcon(row.id);
                return (
                  <View
                    key={row.id}
                    style={[styles.statCard, { backgroundColor: bg, borderColor: border }]}
                  >
                    <View style={styles.statHead}>
                      {icon ? (
                        <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
                          <Feather name={icon} size={14} color={color} />
                        </View>
                      ) : null}
                      <Text style={[styles.statValue, { color }]}>{row.value}</Text>
                    </View>
                    <Text style={[styles.statLabel, { color }]}>{row.label}</Text>
                  </View>
                );
              })}
            </View>
          );
        }

        return (
          <View
            key={section.id}
            style={[styles.section, { backgroundColor: bg, borderColor: border }]}
          >
            {section.title ? (
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color,
                    backgroundColor: iconBg,
                    borderBottomColor: border,
                  },
                ]}
              >
                {section.title}
              </Text>
            ) : null}
            {section.rows.map((row, index) => {
              const icon = getProfileRowIcon(row.id);
              const isLast = index === section.rows.length - 1;
              const isBoolean = isBooleanProfileRow(row.id);
              const isYes = row.value === "Да";
              const isNo = row.value === "Нет";

              return (
                <View
                  key={row.id}
                  style={[
                    styles.detailRow,
                    { borderBottomColor: border },
                    isLast && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.detailLabelRow}>
                    {icon ? (
                      <View style={[styles.detailIconWrap, { backgroundColor: iconBg }]}>
                        <Feather name={icon} size={13} color={color} />
                      </View>
                    ) : null}
                    <Text style={[styles.detailLabel, { color }]}>{row.label}</Text>
                  </View>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: isBoolean ? undefined : semanticColors.textSecondary },
                      isBoolean && isYes && [
                        styles.detailValuePositive,
                        {
                          backgroundColor: semanticColors.surfaceMuted,
                          color: semanticColors.textSecondary,
                        },
                      ],
                      isBoolean && isNo && [
                        styles.detailValueMuted,
                        {
                          backgroundColor: semanticColors.surfaceMuted,
                          color: semanticColors.textMuted,
                        },
                      ],
                    ]}
                  >
                    {row.value}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};
