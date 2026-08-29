import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, Text, useWindowDimensions, View } from "react-native";

import { fetchUserPhone } from "@/entities/user/api/fetchUserPhone";
import { formatSearchRowRatingCompact } from "@/entities/user/lib/formatSearchRowRating";
import {
  formatRuPhoneDisplayOrEmpty,
  RU_PHONE_EMPTY_LABEL,
  toRuPhoneTelHref,
} from "@/entities/user/lib/ruPhone";
import { SELLER_PRODUCTS_PAGE_LAYOUT as L } from "@/features/seller-products-page/lib/sellerProductsPageLayout";
import { SELLER_PRODUCTS_PAGE_UI, USER_PROFILE_COPY } from "@/shared/config";
import { useSellerProfileQuickStatsStyles } from "@/shared/theme/sellerFlowStyles";

const EM_DASH = "—";

type SellerProfileQuickStatsProps = {
  seller: Record<string, unknown>;
  userId: string;
  hidePhoneUntilReveal?: boolean;
};

const resolvePhoneRow = (seller: Record<string, unknown>) => {
  const phone = String(seller.userPhoneNumber ?? "").trim();
  const hasPhoneNumber = seller.hasPhoneNumber === true || Boolean(phone);

  if (!hasPhoneNumber) {
    return {
      display: RU_PHONE_EMPTY_LABEL,
      href: null as string | null,
      needsPhoneReveal: false,
    };
  }

  return {
    display: phone ? formatRuPhoneDisplayOrEmpty(phone) : "",
    href: phone ? toRuPhoneTelHref(phone) : null,
    needsPhoneReveal: !phone,
  };
};

export const SellerProfileQuickStats = ({
  seller,
  userId,
  hidePhoneUntilReveal = true,
}: SellerProfileQuickStatsProps) => {
  const styles = useSellerProfileQuickStatsStyles();
  const { width } = useWindowDimensions();
  const compactStats = width <= L.statsStackBreakpoint;
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealPending, setRevealPending] = useState(false);
  const [revealError, setRevealError] = useState("");

  const phoneRow = useMemo(() => resolvePhoneRow(seller), [seller]);

  useEffect(() => {
    setPhoneRevealed(false);
    setRevealedPhone(null);
    setRevealError("");
  }, [userId, phoneRow.display, phoneRow.href, phoneRow.needsPhoneReveal]);

  const followersValue =
    seller.followersCount == null
      ? "0"
      : String(Math.max(0, Math.floor(Number(seller.followersCount)) || 0));

  const ratingValue = formatSearchRowRatingCompact(
    seller.userRatingByVotes as Parameters<typeof formatSearchRowRatingCompact>[0],
  );

  const phoneDisplay = revealedPhone
    ? formatRuPhoneDisplayOrEmpty(revealedPhone)
    : phoneRow.display;
  const phoneHref = revealedPhone ? toRuPhoneTelHref(revealedPhone) : phoneRow.href;

  const phoneNeedsReveal =
    hidePhoneUntilReveal &&
    (Boolean(phoneRow.href) || phoneRow.needsPhoneReveal) &&
    !phoneRevealed;

  const stats = [
    {
      key: "followers" as const,
      label: USER_PROFILE_COPY.LABELS.followersCount,
      value: followersValue,
      href: null as string | null,
      needsReveal: false,
      needsPhoneReveal: false,
    },
    {
      key: "rating" as const,
      label: SELLER_PRODUCTS_PAGE_UI.STATS_VOTE_RATING,
      value: ratingValue,
      href: null as string | null,
      needsReveal: false,
      needsPhoneReveal: false,
    },
    {
      key: "phone" as const,
      label: USER_PROFILE_COPY.LABELS.userPhoneNumber,
      value: phoneDisplay,
      href: phoneHref,
      needsReveal: phoneNeedsReveal,
      needsPhoneReveal: phoneRow.needsPhoneReveal,
    },
  ];

  const handleRevealPhone = async (needsPhoneReveal: boolean) => {
    if (needsPhoneReveal) {
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
  };

  const renderValue = (row: (typeof stats)[number]) => {
    if (row.key === "phone" && row.needsReveal) {
      return (
        <View style={styles.reveal}>
          <Pressable
            onPress={() => {
              void handleRevealPhone(row.needsPhoneReveal);
            }}
            disabled={revealPending}
            accessibilityRole="button"
          >
            <Text style={styles.revealText}>
              {revealPending
                ? USER_PROFILE_COPY.SHOW_PHONE_NUMBER_PENDING
                : USER_PROFILE_COPY.SHOW_PHONE_NUMBER}
            </Text>
          </Pressable>
          {revealError ? (
            <Text style={styles.revealError} accessibilityRole="alert">
              {revealError}
            </Text>
          ) : null}
        </View>
      );
    }

    if (row.href && row.value !== RU_PHONE_EMPTY_LABEL) {
      return (
        <Pressable
          onPress={() => {
            void Linking.openURL(row.href!).catch(() => undefined);
          }}
          accessibilityRole="link"
        >
          <Text
            style={[
              styles.value,
              row.key === "phone" && styles.valuePhone,
              styles.link,
            ]}
          >
            {row.value}
          </Text>
        </Pressable>
      );
    }

    return (
      <Text
        style={[styles.value, row.key === "phone" && styles.valuePhone]}
      >
        {row.value || EM_DASH}
      </Text>
    );
  };

  return (
    <View style={styles.root} accessibilityLabel={SELLER_PRODUCTS_PAGE_UI.STATS_ARIA}>
      <View style={compactStats ? styles.gridCompact : styles.gridRow}>
        {stats.map((row) => (
          <View
            key={row.key}
            style={[
              styles.item,
              compactStats && row.key === "phone" ? styles.itemCompactFull : null,
              compactStats && row.key !== "phone" ? styles.itemCompactHalf : null,
              !compactStats && row.key === "followers" && styles.itemFollowers,
              !compactStats && row.key === "rating" && styles.itemRating,
              !compactStats && row.key === "phone" && styles.itemPhone,
            ]}
          >
            <View style={styles.body}>
              {renderValue(row)}
              <Text style={styles.label}>{row.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
