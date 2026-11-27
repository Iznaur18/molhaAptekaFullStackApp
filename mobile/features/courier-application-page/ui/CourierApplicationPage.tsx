import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

import {
  useMyCourierProfileQuery,
  useSubmitCourierApplicationMutation,
} from "@/entities/courier/model/useCourierQueries";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { CourierDocumentField } from "@/features/courier-application-page/ui/CourierDocumentField";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountScrollBody } from "@/features/profile-tab/ui/ProfileAccountScrollBody";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { AUTH_UI, COURIER_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useServicesProfilePageStyles } from "@/shared/theme/servicesProfilePageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const STATUS_LABEL: Record<string, string> = {
  none: COURIER_UI.STATUS_NONE,
  pending: COURIER_UI.STATUS_PENDING,
  approved: COURIER_UI.STATUS_APPROVED,
  rejected: COURIER_UI.STATUS_REJECTED,
};

const DOCUMENT_FIELDS = [
  { field: "vehiclePhotoFrontUrl", label: COURIER_UI.FIELD_PHOTO_FRONT },
  { field: "vehiclePhotoRearUrl", label: COURIER_UI.FIELD_PHOTO_REAR },
  { field: "driverLicensePhotoUrl", label: COURIER_UI.FIELD_PHOTO_LICENSE },
  {
    field: "vehicleRegistrationPhotoUrl",
    label: COURIER_UI.FIELD_PHOTO_REGISTRATION,
  },
] as const;

type FormState = {
  vehicleMake: string;
  vehicleColor: string;
  vehiclePlate: string;
  vehiclePhotoFrontUrl: string;
  vehiclePhotoRearUrl: string;
  driverLicensePhotoUrl: string;
  vehicleRegistrationPhotoUrl: string;
};

const emptyForm = (): FormState => ({
  vehicleMake: "",
  vehicleColor: "",
  vehiclePlate: "",
  vehiclePhotoFrontUrl: "",
  vehiclePhotoRearUrl: "",
  driverLicensePhotoUrl: "",
  vehicleRegistrationPhotoUrl: "",
});

export const CourierApplicationPage = () => {
  const router = useRouter();
  const styles = useServicesProfilePageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const isAuthorized = useIsAuthorized();
  const profileQuery = useMyCourierProfileQuery(isAuthorized);
  const submitMutation = useSubmitCourierApplicationMutation();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const profile = profileQuery.data;
  const status = profile?.moderationStatus ?? "none";
  const isPending = status === "pending";

  useEffect(() => {
    if (!profile) return;
    setForm({
      vehicleMake: profile.vehicleMake ?? "",
      vehicleColor: profile.vehicleColor ?? "",
      vehiclePlate: profile.vehiclePlate ?? "",
      vehiclePhotoFrontUrl: profile.vehiclePhotoFrontUrl ?? "",
      vehiclePhotoRearUrl: profile.vehiclePhotoRearUrl ?? "",
      driverLicensePhotoUrl: profile.driverLicensePhotoUrl ?? "",
      vehicleRegistrationPhotoUrl: profile.vehicleRegistrationPhotoUrl ?? "",
    });
  }, [profile]);

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>{COURIER_UI.LOGIN_HINT}</Text>
        <AppButton
          label={AUTH_UI.LOGIN_BUTTON}
          variant="primary"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    );
  }

  if (profileQuery.isPending) {
    return <ScreenLoadingState message={COURIER_UI.LOADING} />;
  }

  if (profileQuery.isError) {
    return (
      <ScreenErrorState
        message={profileQuery.error.message}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  const hasAllDocuments = DOCUMENT_FIELDS.every(({ field }) => Boolean(form[field]));
  const canSubmit =
    !isPending &&
    hasAllDocuments &&
    form.vehicleMake.trim().length >= 2 &&
    form.vehicleColor.trim().length >= 2 &&
    form.vehiclePlate.trim().length >= 5 &&
    !submitMutation.isPending;

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
        accessibilityLabel={COURIER_UI.TITLE}
      >
        <View style={styles.root}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_COURIER}
            onPress={() => setNavSheetVisible(true)}
          />

          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title} accessibilityRole="header">
                {COURIER_UI.TITLE}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{STATUS_LABEL[status] ?? status}</Text>
              </View>
            </View>
            <Text style={styles.lead}>{COURIER_UI.INTRO}</Text>
            {profile?.hasAddress === false ? (
              <Text style={styles.warn}>{COURIER_UI.ADDRESS_REQUIRED}</Text>
            ) : null}
            {status === "approved" ? (
              <Text style={styles.ok}>
                {COURIER_UI.APPROVED_HINT}
                {profile?.addressCity
                  ? ` ${COURIER_UI.REGION(profile.addressCity)}`
                  : ""}
              </Text>
            ) : null}
            {status === "rejected" && profile?.moderationComment ? (
              <Text style={styles.error}>
                {COURIER_UI.REJECTION_REASON}: {profile.moderationComment}
              </Text>
            ) : null}
          </View>

          <View style={styles.block}>
            <Text style={styles.subtitle}>{COURIER_UI.VEHICLE_SECTION}</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{COURIER_UI.FIELD_MAKE}</Text>
              <TextInput
                style={styles.input}
                value={form.vehicleMake}
                onChangeText={(vehicleMake) =>
                  setForm((prev) => ({ ...prev, vehicleMake }))
                }
                placeholder={COURIER_UI.PLACEHOLDER_MAKE}
                editable={!isPending && !submitMutation.isPending}
                maxLength={60}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{COURIER_UI.FIELD_COLOR}</Text>
              <TextInput
                style={styles.input}
                value={form.vehicleColor}
                onChangeText={(vehicleColor) =>
                  setForm((prev) => ({ ...prev, vehicleColor }))
                }
                placeholder={COURIER_UI.PLACEHOLDER_COLOR}
                editable={!isPending && !submitMutation.isPending}
                maxLength={30}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{COURIER_UI.FIELD_PLATE}</Text>
              <TextInput
                style={styles.input}
                value={form.vehiclePlate}
                onChangeText={(vehiclePlate) =>
                  setForm((prev) => ({ ...prev, vehiclePlate }))
                }
                placeholder={COURIER_UI.PLACEHOLDER_PLATE}
                editable={!isPending && !submitMutation.isPending}
                maxLength={15}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.subtitle}>{COURIER_UI.DOCS_HEADING}</Text>
            <Text style={styles.hint}>{COURIER_UI.DOCS_HINT}</Text>
            <View style={styles.docsGrid}>
              {DOCUMENT_FIELDS.map(({ field, label }) => (
                <CourierDocumentField
                  key={field}
                  label={label}
                  value={form[field]}
                  disabled={isPending || submitMutation.isPending}
                  onChange={(url) => setForm((prev) => ({ ...prev, [field]: url }))}
                  onError={setError}
                />
              ))}
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!hasAllDocuments && !isPending ? (
            <Text style={styles.hint}>{COURIER_UI.PHOTO_REQUIRED}</Text>
          ) : null}

          {!isPending ? (
            <AppButton
              label={
                submitMutation.isPending
                  ? COURIER_UI.SUBMITTING
                  : status === "rejected"
                    ? COURIER_UI.RESUBMIT
                    : COURIER_UI.SUBMIT
              }
              variant="primary"
              disabled={!canSubmit}
              onPress={() => {
                setError("");
                submitMutation.mutate(form, {
                  onError: (submitError) =>
                    setError(
                      submitError instanceof Error
                        ? submitError.message
                        : COURIER_UI.ERROR_GENERIC,
                    ),
                });
              }}
            />
          ) : (
            <Text style={styles.muted}>{COURIER_UI.PENDING_HINT}</Text>
          )}

          <Text style={styles.muted}>{COURIER_UI.PRIVACY_NOTE}</Text>
        </View>
      </ProfileAccountScrollBody>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="courier"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
