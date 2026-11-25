import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { fetchUserPhone } from "@/entities/user/api/fetchUserPhone";
import type { ProfileRow } from "@/entities/user/lib/getUserProfileRows";
import {
  groupProfileRows,
  isBooleanProfileRow,
} from "@/entities/user/lib/groupProfileRows";
import { getProfileRowIcon } from "@/entities/user/lib/profileRowIcons";
import {
  PROFILE_STATS_SECTION_ID,
  PROFILE_STATS_WIDE_ROW_IDS,
} from "@/entities/user/lib/profileStatIconGradients";
import {
  formatRuPhoneDisplayOrEmpty,
  RU_PHONE_EMPTY_LABEL,
  toRuPhoneTelHref,
} from "@/entities/user/lib/ruPhone";
import { ProfileEmailReveal } from "@/entities/user/ui/ProfileEmailReveal";
import { ProfileStatCard } from "@/entities/user/ui/ProfileStatCard";
import { useUserProfileInfoPanelStyles } from "@/entities/user/ui/userProfileInfoPanelStyles";
import { USER_PROFILE_COPY } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

const PHONE_ROW_ID = "userPhoneNumber";

type UserProfileInfoPanelProps = {
  rows: ProfileRow[];
  hidePhoneUntilReveal?: boolean;
  userId?: string | null;
  accountSectionFooter?: ReactNode;
  /** Свой профиль: id строки → переход (паритет web `rowActions`). */
  rowActions?: Record<string, () => void> | null;
};

const openProfileRowHref = (href: string) => {
  void Linking.openURL(href).catch(() => undefined);
};

type ProfileDetailValueProps = {
  row: ProfileRow;
  hidePhoneUntilReveal: boolean;
  userId: string | null;
  styles: ReturnType<typeof useUserProfileInfoPanelStyles>;
};

const ProfileDetailPlainValue = ({
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
    revealedPhone != null ? (toRuPhoneTelHref(revealedPhone) ?? undefined) : row.href;
  const displayValue =
    revealedPhone != null ? formatRuPhoneDisplayOrEmpty(revealedPhone) : row.value;

  const isBoolean = isBooleanProfileRow(row.id);
  const isYes = displayValue === "Да";
  const isNo = displayValue === "Нет";
  const isEmpty =
    !row.needsPhoneReveal &&
    !row.needsEmailReveal &&
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
          accessibilityRole="button"
          accessibilityLabel={USER_PROFILE_COPY.SHOW_PHONE_NUMBER}
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

const ProfileDetailValue = ({
  row,
  hidePhoneUntilReveal,
  userId,
  styles,
}: ProfileDetailValueProps) => {
  if (row.needsEmailReveal) {
    return <ProfileEmailReveal userId={userId} />;
  }

  return (
    <ProfileDetailPlainValue
      row={row}
      hidePhoneUntilReveal={hidePhoneUntilReveal}
      userId={userId}
      styles={styles}
    />
  );
};

type ProfileDetailsSectionProps = {
  sectionId: string;
  title: string | null;
  rows: ProfileRow[];
  hidePhoneUntilReveal: boolean;
  userId: string | null;
  sectionFooter?: ReactNode;
  rowActions?: Record<string, () => void> | null;
};

const ProfileDetailsSection = ({
  sectionId,
  title,
  rows,
  hidePhoneUntilReveal,
  userId,
  sectionFooter = null,
  rowActions = null,
}: ProfileDetailsSectionProps) => {
  const theme = useAppTheme();
  const styles = useUserProfileInfoPanelStyles();
  const isStatsSection = sectionId === PROFILE_STATS_SECTION_ID;

  if (isStatsSection) {
    return (
      <View style={styles.section}>
        {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
        <View style={styles.statsGrid}>
          {rows.map((row) => (
            <ProfileStatCard
              key={row.id}
              row={row}
              isWide={PROFILE_STATS_WIDE_ROW_IDS.has(row.id)}
              onPress={rowActions?.[row.id] ?? null}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {rows.map((row, index) => {
        const icon = getProfileRowIcon(row.id);
        const isLast = index === rows.length - 1 && !sectionFooter;

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
      {sectionFooter}
    </View>
  );
};

export const UserProfileInfoPanel = ({
  rows,
  hidePhoneUntilReveal = false,
  userId = null,
  accountSectionFooter = null,
  rowActions = null,
}: UserProfileInfoPanelProps) => {
  const styles = useUserProfileInfoPanelStyles();
  const sections = useMemo(() => groupProfileRows(rows), [rows]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <View style={styles.root}>
      {sections.map((section) => (
        <ProfileDetailsSection
          key={section.id}
          sectionId={section.id}
          title={section.title}
          rows={section.rows}
          hidePhoneUntilReveal={hidePhoneUntilReveal}
          userId={userId}
          sectionFooter={section.id === "account" ? accountSectionFooter : null}
          rowActions={rowActions}
        />
      ))}
    </View>
  );
};
