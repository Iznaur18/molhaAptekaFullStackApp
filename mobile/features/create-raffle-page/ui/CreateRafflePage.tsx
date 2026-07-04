import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useCreateRaffleMutation } from "@/entities/raffle/model/useCreateRaffleMutation";
import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import {
  applyCreateRaffleMediaTypeChange,
  buildCreateRaffleSubmitBody,
  INITIAL_CREATE_RAFFLE_FORM,
  type CreateRaffleFormState,
  type PrizeMediaType,
  validateCreateRaffleForm,
} from "@/features/create-raffle-page/lib/createRaffleForm";
import { CreateRaffleFormBody } from "@/features/create-raffle-page/ui/CreateRaffleFormBody";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import {
  CREATE_RAFFLE_MODAL_UI,
  CREATE_RAFFLE_PAGE_UI,
  MY_PROFILE_PAGE_UI,
} from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useCreateRafflePageStyles } from "@/shared/theme/createRafflePageStyles";

export const CreateRafflePage = () => {
  const router = useRouter();
  const styles = useCreateRafflePageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const { isUserDataConfirmed } = useUserAccess();
  const createMutation = useCreateRaffleMutation();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [form, setForm] = useState<CreateRaffleFormState>(INITIAL_CREATE_RAFFLE_FORM);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      setErrorMessage("");
      setSuccessMessage("");
    }, []),
  );

  const isSubmitting = createMutation.isPending;

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateCreateRaffleForm(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await createMutation.mutateAsync(buildCreateRaffleSubmitBody(form));
      setSuccessMessage(CREATE_RAFFLE_PAGE_UI.SUCCESS);
      setForm(INITIAL_CREATE_RAFFLE_FORM);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : CREATE_RAFFLE_PAGE_UI.SUBMIT_FALLBACK,
      );
    }
  };

  const hubChrome = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="create-raffle"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
    />
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{CREATE_RAFFLE_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButtonText}>{CREATE_RAFFLE_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (!isUserDataConfirmed) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>
            <ProfileMobileSectionToggle
              activeLabel={MY_PROFILE_PAGE_UI.TAB_CREATE_RAFFLE}
              onPress={() => setNavSheetVisible(true)}
            />
          </View>
          <Text style={styles.state}>{CREATE_RAFFLE_PAGE_UI.CONFIRMED_DATA_REQUIRED}</Text>
        </View>
        {hubChrome}
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingBottom: contentPaddingBottom },
        ]}
        accessibilityLabel={CREATE_RAFFLE_MODAL_UI.ARIA_DIALOG}
      >
        <View style={styles.header}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_CREATE_RAFFLE}
            onPress={() => setNavSheetVisible(true)}
          />
        </View>

        <CreateRaffleFormBody
          form={form}
          onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onMediaTypeChange={(prizeMediaType: PrizeMediaType) =>
            setForm((prev) => applyCreateRaffleMediaTypeChange(prev, prizeMediaType))
          }
          isSubmitting={isSubmitting}
          hintText={CREATE_RAFFLE_MODAL_UI.HINT}
          errorMessage={errorMessage}
          submitLabel={CREATE_RAFFLE_MODAL_UI.SUBMIT}
          onSubmit={() => {
            void handleSubmit();
          }}
        />

        {successMessage ? (
          <Text style={styles.success} accessibilityRole="text">
            {successMessage}
          </Text>
        ) : null}
      </ScrollView>
      {hubChrome}
    </>
  );
};
