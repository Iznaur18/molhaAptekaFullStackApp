import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { izColors } from "@izibuy/design-tokens";

import type { ProfileRow } from "@/entities/user/lib/getUserProfileRows";
import {
  groupProfileRows,
  isBooleanProfileRow,
} from "@/entities/user/lib/groupProfileRows";
import { getProfileRowIcon } from "@/entities/user/lib/profileRowIcons";
import { PROFILE_CARD_SQUIRCLE_RADIUS } from "@/shared/theme/profileChromeStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type UserProfileInfoPanelProps = {
  rows: ProfileRow[];
};

/** Section chrome stays black/white in all themes (dark remaps `ink` to white). */
const PROFILE_INFO_SECTION_TITLE_BG = izColors.nearBlack;
const PROFILE_INFO_SECTION_TITLE_FG = izColors.onContrast;

const useStyles = createThemedStyles((theme) => ({
  root: {
    gap: theme.spacing[4],
  },
  section: {
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: PROFILE_INFO_SECTION_TITLE_BG,
    color: PROFILE_INFO_SECTION_TITLE_FG,
    borderBottomColor: PROFILE_INFO_SECTION_TITLE_BG,
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
    borderBottomColor: theme.colors.border,
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
    backgroundColor: theme.colors.surfaceMuted,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "right",
    flexShrink: 0,
    marginLeft: "auto",
    color: theme.colors.textSecondary,
  },
  detailValuePositive: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
  },
  detailValueMuted: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textMuted,
  },
  iconColor: {
    color: theme.colors.textSecondary,
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
        <SquircleView
          key={section.id}
          radius={PROFILE_CARD_SQUIRCLE_RADIUS}
          style={styles.section}
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
                style={[styles.detailRow, isLast && { borderBottomWidth: 0 }]}
              >
                <View style={styles.detailLabelRow}>
                  {icon ? (
                    <View style={styles.detailIconWrap}>
                      <Feather name={icon} size={13} color={styles.iconColor.color} />
                    </View>
                  ) : null}
                  <Text style={styles.detailLabel}>{row.label}</Text>
                </View>
                <Text
                  style={[
                    styles.detailValue,
                    isBoolean && isYes && styles.detailValuePositive,
                    isBoolean && isNo && styles.detailValueMuted,
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            );
          })}
        </SquircleView>
      ))}
    </View>
  );
};
