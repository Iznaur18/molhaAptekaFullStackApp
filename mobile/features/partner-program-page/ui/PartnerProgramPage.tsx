import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";

import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useConvertPartnerBalanceMutation } from "@/entities/user/model/useConvertPartnerBalanceMutation";
import { useMyReferralProgramQuery } from "@/entities/user/model/useMyReferralProgramQuery";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { MY_PROFILE_PAGE_UI, PARTNER_PROGRAM_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { createClientIdempotencyKey } from "@/shared/lib/createClientIdempotencyKey";
import { formatRubPriceInput, parseRubPriceInput } from "@/shared/lib/rubPriceInput";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { usePartnerProgramPageStyles } from "@/shared/theme/partnerProgramPageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const PartnerProgramPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = usePartnerProgramPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const query = useMyReferralProgramQuery(isAuthorized);
  const convertMutation = useConvertPartnerBalanceMutation();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [convertAmountRaw, setConvertAmountRaw] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void query.refetch();
      }
    }, [isAuthorized, query.refetch]),
  );

  const convertAmount = useMemo(
    () => parseRubPriceInput(convertAmountRaw) ?? 0,
    [convertAmountRaw],
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{PARTNER_PROGRAM_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.loginButtonText}>
            {PARTNER_PROGRAM_PAGE_UI.LOGIN_BUTTON}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (query.isLoading) {
    return <ScreenLoadingState message={PARTNER_PROGRAM_PAGE_UI.LOADING} />;
  }

  if (query.isError || !query.data) {
    return (
      <ScreenErrorState
        message={
          query.error instanceof Error
            ? query.error.message
            : PARTNER_PROGRAM_PAGE_UI.LOAD_ERROR
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const data = query.data;
  const canConvert =
    !convertMutation.isPending &&
    convertAmount > 0 &&
    convertAmount <= data.partnerBalance;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(data.inviteUrl);
      setFeedbackIsError(false);
      setFeedback(PARTNER_PROGRAM_PAGE_UI.COPIED);
    } catch {
      setFeedbackIsError(true);
      setFeedback(PARTNER_PROGRAM_PAGE_UI.COPY_FAILED);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: data.inviteUrl });
    } catch {
      // ignore cancel
    }
  };

  const handleConvert = async () => {
    if (!canConvert) {
      return;
    }
    try {
      await convertMutation.mutateAsync({
        amount: convertAmount,
        idempotencyKey: createClientIdempotencyKey(),
      });
      setConvertAmountRaw("");
      setFeedbackIsError(false);
      setFeedback(PARTNER_PROGRAM_PAGE_UI.CONVERT_SUCCESS);
    } catch (error) {
      setFeedbackIsError(true);
      setFeedback(
        formatApiErrorMessage(error, PARTNER_PROGRAM_PAGE_UI.CONVERT_ERROR),
      );
    }
  };

  const referralRows = data.referrals.map((row, index) => {
    const isLast = index === data.referrals.length - 1;
    return (
      <View
        key={row.userId}
        style={[styles.referralRow, isLast ? { borderBottomWidth: 0 } : null]}
      >
        <Text style={styles.referralName}>{row.userName}</Text>
        <Text style={styles.referralMeta}>
          {PARTNER_PROGRAM_PAGE_UI.COL_DATE}:{" "}
          {row.registeredAt
            ? new Date(row.registeredAt).toLocaleDateString("ru-RU")
            : "—"}
        </Text>
        <Text style={styles.referralMeta}>
          {PARTNER_PROGRAM_PAGE_UI.COL_SPEND}: {row.pointsSpentTotal} ·{" "}
          {PARTNER_PROGRAM_PAGE_UI.COL_CASHBACK}: {row.cashbackEarnedTotal}
        </Text>
      </View>
    );
  });

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingBottom: contentPaddingBottom },
        ]}
        accessibilityLabel={PARTNER_PROGRAM_PAGE_UI.ARIA}
      >
        <View style={styles.header}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_PARTNER_PROGRAM}
            onPress={() => setNavSheetVisible(true)}
          />

          <View
            style={styles.balanceCard}
            accessibilityLabel={`${PARTNER_PROGRAM_PAGE_UI.BALANCE_CAPTION}: ${data.partnerBalance}`}
          >
            <View style={styles.balanceTextBlock}>
              <Text style={styles.balanceCaption}>
                {PARTNER_PROGRAM_PAGE_UI.BALANCE_CAPTION}
              </Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceValue}>{data.partnerBalance}</Text>
                <Text style={styles.balanceUnit}>
                  {PARTNER_PROGRAM_PAGE_UI.BALANCE_UNIT}
                </Text>
              </View>
              <Text style={styles.balanceInfo}>
                {PARTNER_PROGRAM_PAGE_UI.INFO(data.cashbackPercent)}
              </Text>
            </View>
            <View style={styles.balanceIconWrap}>
              <Feather name="users" size={26} color={theme.colors.onContrast} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{PARTNER_PROGRAM_PAGE_UI.STATS_TITLE}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>
                {PARTNER_PROGRAM_PAGE_UI.STAT_REFERRALS}
              </Text>
              <Text style={styles.statValue}>{data.totalReferrals}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{PARTNER_PROGRAM_PAGE_UI.STAT_SPEND}</Text>
              <Text style={styles.statValue}>{data.totalReferralsSpend}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>
                {PARTNER_PROGRAM_PAGE_UI.STAT_EARNED}
              </Text>
              <Text style={styles.statValue}>{data.totalCashbackEarned}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{PARTNER_PROGRAM_PAGE_UI.INVITE_TITLE}</Text>
          <Text style={styles.cardHint}>{PARTNER_PROGRAM_PAGE_UI.INVITE_HINT}</Text>
          <Text style={styles.inviteUrl} numberOfLines={3}>
            {data.inviteUrl}
          </Text>
          <View style={styles.actionsRow}>
            <AppButton
              label={PARTNER_PROGRAM_PAGE_UI.COPY_BUTTON}
              variant="secondary"
              style={styles.actionButton}
              onPress={handleCopy}
            />
            <AppButton
              label={PARTNER_PROGRAM_PAGE_UI.SHARE_BUTTON}
              variant="primary"
              style={styles.actionButton}
              onPress={handleShare}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {PARTNER_PROGRAM_PAGE_UI.CONVERT_SECTION}
          </Text>
          <Text style={styles.fieldLabel}>{PARTNER_PROGRAM_PAGE_UI.CONVERT_LABEL}</Text>
          <TextInput
            style={styles.input}
            value={convertAmountRaw}
            onChangeText={(value) => {
              setConvertAmountRaw(formatRubPriceInput(value));
              setFeedback("");
            }}
            keyboardType="number-pad"
            inputMode="numeric"
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.cardHint}>{PARTNER_PROGRAM_PAGE_UI.CONVERT_HINT}</Text>
          <AppButton
            label={
              convertMutation.isPending
                ? PARTNER_PROGRAM_PAGE_UI.CONVERT_PENDING
                : PARTNER_PROGRAM_PAGE_UI.CONVERT_BUTTON
            }
            variant="primary"
            style={styles.submitButton}
            onPress={handleConvert}
            disabled={!canConvert}
          />
        </View>

        {feedback ? (
          <Text
            style={[styles.feedback, feedbackIsError ? styles.feedbackError : null]}
            accessibilityRole="alert"
          >
            {feedback}
          </Text>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{PARTNER_PROGRAM_PAGE_UI.LIST_TITLE}</Text>
          {data.referrals.length === 0 ? (
            <Text style={styles.empty}>{PARTNER_PROGRAM_PAGE_UI.LIST_EMPTY}</Text>
          ) : (
            referralRows
          )}
        </View>
      </ScrollView>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        onClose={() => setNavSheetVisible(false)}
      />
    </>
  );
};
