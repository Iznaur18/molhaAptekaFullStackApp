import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ProfileRow } from "@/entities/user/lib/getUserProfileRows";
import {
  groupProfileRows,
  isBooleanProfileRow,
} from "@/entities/user/lib/groupProfileRows";
import { getProfileRowIcon } from "@/entities/user/lib/profileRowIcons";
import { PROFILE_CARD_SQUIRCLE_RADIUS } from "@/shared/theme/profileChromeStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { semanticColors } from "@/shared/theme/semanticColors";
import { SquircleView } from "@/shared/ui/SquircleView";

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
  section: {
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.ink,
    color: theme.colors.onContrast,
    borderBottomColor: theme.colors.ink,
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
      {sections.map((section) => {
        const { bg, border, color, iconBg } = PROFILE_INFO_PALETTE;

        return (
          <SquircleView
            key={section.id}
            radius={PROFILE_CARD_SQUIRCLE_RADIUS}
            style={[styles.section, { backgroundColor: bg, borderColor: border }]}
          >
            {section.title ? (
              <Text style={styles.sectionTitle}>{section.title}</Text>
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
          </SquircleView>
        );
      })}
    </View>
  );
};
