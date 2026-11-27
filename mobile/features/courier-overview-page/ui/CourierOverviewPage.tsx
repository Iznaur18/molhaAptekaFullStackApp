import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  useAcceptCourierShipmentMutation,
  useCourierOverviewQuery,
  useMyCourierDeliveriesQuery,
  useMyCourierProfileQuery,
} from "@/entities/courier/model/useCourierQueries";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { CourierDeliveryCard } from "@/features/courier-overview-page/ui/CourierDeliveryCard";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountScrollBody } from "@/features/profile-tab/ui/ProfileAccountScrollBody";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { AUTH_UI, COURIER_OVERVIEW_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useServicesProfilePageStyles } from "@/shared/theme/servicesProfilePageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ModalSectionTabs } from "@/shared/ui/ModalSectionTabs";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const TABS = [
  { id: "free", label: COURIER_OVERVIEW_UI.TAB_FREE },
  { id: "mine", label: COURIER_OVERVIEW_UI.TAB_MINE },
] as const;

export const CourierOverviewPage = () => {
  const router = useRouter();
  const styles = useServicesProfilePageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const isAuthorized = useIsAuthorized();

  const [tab, setTab] = useState<"free" | "mine">("free");
  const [error, setError] = useState("");
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const profileQuery = useMyCourierProfileQuery(isAuthorized);
  const isApproved = profileQuery.data?.moderationStatus === "approved";

  // Гео опционально: без expo-location сортируем от адреса профиля.
  const coords = null;
  const overviewQuery = useCourierOverviewQuery({
    enabled: isAuthorized && isApproved && tab === "free",
    coords,
  });
  const deliveriesQuery = useMyCourierDeliveriesQuery(
    isAuthorized && isApproved && tab === "mine",
  );
  const acceptMutation = useAcceptCourierShipmentMutation();

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>{COURIER_OVERVIEW_UI.LOGIN_HINT}</Text>
        <AppButton
          label={AUTH_UI.LOGIN_BUTTON}
          variant="primary"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    );
  }

  if (profileQuery.isPending) {
    return <ScreenLoadingState message={COURIER_OVERVIEW_UI.LOADING} />;
  }

  if (profileQuery.isError) {
    return (
      <ScreenErrorState
        message={profileQuery.error.message}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  if (!isApproved) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>{COURIER_OVERVIEW_UI.NOT_APPROVED}</Text>
        <AppButton
          label={MY_PROFILE_PAGE_UI.TAB_COURIER}
          variant="primary"
          onPress={() => router.push("/hub/courier" as never)}
        />
      </View>
    );
  }

  const activeQuery = tab === "free" ? overviewQuery : deliveriesQuery;
  const freeRows = overviewQuery.data?.shipments ?? [];
  const mineRows = deliveriesQuery.data?.deliveries ?? [];

  return (
    <>
      <ProfileAccountScrollBody
        style={[styles.container, scrollEnabled ? centeredContentStyle : null]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          !isDrawerLayout ? styles.contentInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        accessibilityLabel={COURIER_OVERVIEW_UI.TITLE}
      >
        <View style={styles.root}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_COURIER_OVERVIEW}
            onPress={() => setNavSheetVisible(true)}
          />

          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {COURIER_OVERVIEW_UI.TITLE}
            </Text>
            <ModalSectionTabs
              tabs={TABS}
              activeTabId={tab}
              onTabChange={(id) => setTab(id as "free" | "mine")}
            />
            {tab === "free" && overviewQuery.data?.regionCode ? (
              <Text style={styles.hint}>
                {COURIER_OVERVIEW_UI.REGION(
                  overviewQuery.data.regionCode,
                  overviewQuery.data.radiusKm ?? 0,
                )}{" "}
                {COURIER_OVERVIEW_UI.NO_GEO_HINT}
              </Text>
            ) : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {activeQuery.isPending ? (
            <Text style={styles.muted}>{COURIER_OVERVIEW_UI.LOADING}</Text>
          ) : activeQuery.isError ? (
            <Text style={styles.error}>
              {activeQuery.error instanceof Error
                ? activeQuery.error.message
                : COURIER_OVERVIEW_UI.ERROR_GENERIC}
            </Text>
          ) : tab === "free" ? (
            freeRows.length === 0 ? (
              <Text style={styles.muted}>{COURIER_OVERVIEW_UI.EMPTY_FREE}</Text>
            ) : (
              freeRows.map((row) => (
                <View key={`${row.orderId}:${row.sellerId}`} style={styles.card}>
                  <View style={styles.cardRow}>
                    <Text style={styles.fee}>
                      {formatPriceRub(row.deliveryFeeRub ?? 0)}
                    </Text>
                    {row.distanceKm != null ? (
                      <Text style={styles.hint}>
                        {COURIER_OVERVIEW_UI.DISTANCE(row.distanceKm)}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.metaLabel}>{COURIER_OVERVIEW_UI.SELLER}</Text>
                  <Pressable
                    onPress={() =>
                      row.sellerId
                        ? router.push(`/user/${row.sellerId}` as never)
                        : undefined
                    }
                  >
                    <Text style={styles.metaValue}>{row.sellerName || "—"}</Text>
                  </Pressable>
                  {row.buyerName ? (
                    <>
                      <Text style={styles.metaLabel}>{COURIER_OVERVIEW_UI.BUYER}</Text>
                      <Text style={styles.metaValue}>{row.buyerName}</Text>
                    </>
                  ) : null}
                  <Text style={styles.metaLabel}>{COURIER_OVERVIEW_UI.PICKUP}</Text>
                  <Text style={styles.metaValue}>{row.pickupAddress || "—"}</Text>
                  <Text style={styles.metaLabel}>{COURIER_OVERVIEW_UI.DROPOFF}</Text>
                  <Text style={styles.metaValue}>{row.deliveryAreaHint || "—"}</Text>
                  {(row.items ?? []).map((item, index) => (
                    <Text key={`${item.name}-${index}`} style={styles.hint}>
                      {item.name}
                      {item.quantity ? ` × ${item.quantity}` : ""}
                    </Text>
                  ))}
                  <AppButton
                    label={
                      acceptMutation.isPending
                        ? COURIER_OVERVIEW_UI.SAVING
                        : COURIER_OVERVIEW_UI.ACCEPT
                    }
                    variant="primary"
                    disabled={acceptMutation.isPending}
                    onPress={() => {
                      setError("");
                      acceptMutation.mutate(
                        { orderId: row.orderId, sellerId: row.sellerId },
                        {
                          onSuccess: () => setTab("mine"),
                          onError: (acceptError) =>
                            setError(
                              acceptError instanceof Error
                                ? acceptError.message
                                : COURIER_OVERVIEW_UI.ERROR_GENERIC,
                            ),
                        },
                      );
                    }}
                  />
                </View>
              ))
            )
          ) : mineRows.length === 0 ? (
            <Text style={styles.muted}>{COURIER_OVERVIEW_UI.EMPTY_MINE}</Text>
          ) : (
            mineRows.map((delivery) => (
              <CourierDeliveryCard
                key={`${delivery.orderId}:${delivery.sellerId}`}
                delivery={delivery}
                onError={setError}
                onUserPress={(userId) => router.push(`/user/${userId}` as never)}
              />
            ))
          )}
        </View>
      </ProfileAccountScrollBody>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="courier-overview"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
