import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";

import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useMyReferralProgramQuery } from "@/entities/user/model/useMyReferralProgramQuery";
import { AffiliateEarningsPanel } from "@/features/affiliate-listings-page/ui/AffiliateEarningsPanel";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { MY_PROFILE_PAGE_UI, PARTNER_PROGRAM_PAGE_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { usePartnerProgramPageStyles } from "@/shared/theme/partnerProgramPageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const PartnerProgramPage = () => {
  const router = useRouter();
  const styles = usePartnerProgramPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const query = useMyReferralProgramQuery(isAuthorized);
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void query.refetch();
      }
    }, [isAuthorized, query.refetch]),
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
    } catch (error) {
      const isCancel =
        error instanceof Error &&
        (error.name === "AbortError" ||
          /cancel|dismiss/i.test(error.message));
      if (isCancel) {
        return;
      }
      try {
        await Clipboard.setStringAsync(data.inviteUrl);
        setFeedbackIsError(false);
        setFeedback(PARTNER_PROGRAM_PAGE_UI.SHARE_COPIED);
      } catch {
        setFeedbackIsError(true);
        setFeedback(PARTNER_PROGRAM_PAGE_UI.SHARE_FAILED);
      }
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
          <Text style={styles.intro}>{PARTNER_PROGRAM_PAGE_UI.INFO(data.cashbackPercent)}</Text>
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
          {feedback ? (
            <Text
              style={feedbackIsError ? styles.feedbackError : styles.feedback}
              accessibilityRole={feedbackIsError ? "alert" : "text"}
            >
              {feedback}
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{PARTNER_PROGRAM_PAGE_UI.LIST_TITLE}</Text>
          {data.referrals.length === 0 ? (
            <Text style={styles.empty}>{PARTNER_PROGRAM_PAGE_UI.LIST_EMPTY}</Text>
          ) : (
            referralRows
          )}
        </View>

        <AffiliateEarningsPanel />
      </ScrollView>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="partner-program"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
