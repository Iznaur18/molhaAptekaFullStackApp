import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { izColors } from "@izibuy/design-tokens";

import { fetchUserPhone } from "@/entities/user/api/fetchUserPhone";
import type { ProfileRow } from "@/entities/user/lib/getUserProfileRows";
import {
  groupProfileRows,
  isBooleanProfileRow,
} from "@/entities/user/lib/groupProfileRows";
import { getProfileRowIcon } from "@/entities/user/lib/profileRowIcons";
import {
  formatRuPhoneDisplayOrEmpty,
  RU_PHONE_EMPTY_LABEL,
  toRuPhoneTelHref,
} from "@/entities/user/lib/ruPhone";
import { USER_PROFILE_COPY } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { PROFILE_CARD_SQUIRCLE_RADIUS } from "@/shared/theme/profileChromeStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

const PHONE_ROW_ID = "userPhoneNumber";

type UserProfileInfoPanelProps = {
  rows: ProfileRow[];
  hidePhoneUntilReveal?: boolean;
  userId?: string | null;
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
  detailValueEmpty: {
    fontWeight: "500",
    color: theme.colors.textMuted,
  },
  detailValueLink: {
    color: theme.colors.link,
    textDecorationLine: "underline",
  },
  revealPhone: {
    color: theme.colors.link,
    fontWeight: "700",
  },
  revealError: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.danger,
    textAlign: "right",
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
}));

const openProfileRowHref = (href: string) => {
  void Linking.openURL(href).catch(() => undefined);
};

type ProfileDetailValueProps = {
  row: ProfileRow;
  hidePhoneUntilReveal: boolean;
  userId: string | null;
  styles: ReturnType<typeof useStyles>;
};

const ProfileDetailValue = ({
  row,
  hidePhoneUntilReveal,
  userId,
  styles,
}: ProfileDetailValueProps) => {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealPending, setRevealPending] = useState(false);
  const [revealError, setRevealError] = useState("");

  const needsReveal =
    hidePhoneUntilReveal &&
    row.id === PHONE_ROW_ID &&
    (Boolean(row.href) || Boolean(row.needsPhoneReveal));

  const displayHref =
    revealedPhone != null ? toRuPhoneTelHref(revealedPhone) ?? undefined : row.href;
  const displayValue =
    revealedPhone != null ? formatRuPhoneDisplayOrEmpty(revealedPhone) : row.value;

  const isBoolean = isBooleanProfileRow(row.id);
  const isYes = displayValue === "Да";
  const isNo = displayValue === "Нет";
  const isEmpty =
    !row.needsPhoneReveal &&
    (displayValue === "—" || displayValue === RU_PHONE_EMPTY_LABEL);

  useEffect(() => {
    setPhoneRevealed(false);
    setRevealedPhone(null);
    setRevealError("");
  }, [row.href, row.value, row.needsPhoneReveal]);

  if (needsReveal && !phoneRevealed) {
    return (
      <View>
        <Pressable
          disabled={revealPending}
          onPress={() => {
            void (async () => {
              if (row.needsPhoneReveal) {
                if (!userId) {
                  setRevealError(USER_PROFILE_COPY.SHOW_PHONE_NUMBER_ERROR);
                  return;
                }
                setRevealPending(true);
                setRevealError("");
                try {
                  const phone = await fetchUserPhone(userId);
                  setRevealedPhone(phone);
                  setPhoneRevealed(true);
                } catch (error) {
                  setRevealError(
                    error instanceof Error
                      ? error.message
                      : USER_PROFILE_COPY.SHOW_PHONE_NUMBER_ERROR,
                  );
                } finally {
                  setRevealPending(false);
                }
                return;
              }
              setPhoneRevealed(true);
            })();
          }}
        >
          <Text style={[styles.detailValue, styles.revealPhone]}>
            {revealPending
              ? USER_PROFILE_COPY.SHOW_PHONE_NUMBER_PENDING
              : USER_PROFILE_COPY.SHOW_PHONE_NUMBER}
          </Text>
        </Pressable>
        {revealError ? <Text style={styles.revealError}>{revealError}</Text> : null}
      </View>
    );
  }

  const valueNode = (
    <Text
      style={[
        styles.detailValue,
        isEmpty && styles.detailValueEmpty,
        Boolean(displayHref) && styles.detailValueLink,
        isBoolean && isYes && styles.detailValuePositive,
        isBoolean && isNo && styles.detailValueMuted,
      ]}
    >
      {displayValue}
    </Text>
  );

  if (displayHref) {
    return (
      <Pressable onPress={() => openProfileRowHref(displayHref)}>{valueNode}</Pressable>
    );
  }

  return valueNode;
};

export const UserProfileInfoPanel = ({
  rows,
  hidePhoneUntilReveal = false,
  userId = null,
}: UserProfileInfoPanelProps) => {
  const theme = useAppTheme();
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

            return (
              <View
                key={row.id}
                style={[styles.detailRow, isLast && { borderBottomWidth: 0 }]}
              >
                <View style={styles.detailLabelRow}>
                  {icon ? (
                    <View style={styles.detailIconWrap}>
                      <Feather name={icon} size={13} color={theme.colors.textSecondary} />
                    </View>
                  ) : null}
                  <Text style={styles.detailLabel}>{row.label}</Text>
                </View>
                <ProfileDetailValue
                  row={row}
                  hidePhoneUntilReveal={hidePhoneUntilReveal}
                  userId={userId}
                  styles={styles}
                />
              </View>
            );
          })}
        </SquircleView>
      ))}
    </View>
  );
};
