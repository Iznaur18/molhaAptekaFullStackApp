import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { useCreateRaffleMutation } from "@/entities/raffle/model/useCreateRaffleMutation";
import { useCancelRaffleCreateMutation } from "@/entities/raffle/model/useCancelRaffleCreateMutation";
import { useMyRaffleMutations } from "@/entities/raffle/model/useMyRaffleMutations";
import { useMyRaffleQuery } from "@/entities/raffle/model/useMyRaffleQuery";
import { useRaffleCreateAdvertisingQuery } from "@/entities/raffle/model/useRaffleCreateAdvertisingQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import {
  applyCreateRaffleMediaTypeChange,
  buildCreateRaffleSubmitBody,
  CREATE_RAFFLE_WIZARD_STEPS,
  INITIAL_CREATE_RAFFLE_FORM,
  isCreateRaffleFormDirty,
  resolveCreateRaffleWizardStepCopy,
  type CreateRaffleFormState,
  type PrizeMediaType,
  validateCreateRaffleForm,
  validateCreateRaffleFormStep,
} from "@/features/create-raffle-page/lib/createRaffleForm";
import { resolveCreateRaffleBlockNotice } from "@/features/create-raffle-page/lib/resolveCreateRaffleBlockNotice";
import { CreateRaffleBlockNotice } from "@/features/create-raffle-page/ui/CreateRaffleBlockNotice";
import { CreateRaffleFormBody } from "@/features/create-raffle-page/ui/CreateRaffleFormBody";
import { CreateRaffleWizardProgress } from "@/features/create-raffle-page/ui/CreateRaffleWizardProgress";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import {
  API_CLIENT_UI,
  CREATE_RAFFLE_MODAL_UI,
  CREATE_RAFFLE_PAGE_UI,
  MY_PROFILE_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCreateRafflePageStyles } from "@/shared/theme/createRafflePageStyles";

export const CreateRafflePage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useCreateRafflePageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled, resolveListStyle } =
    useProfileAccountNestedListScroll();
  const isAuthorized = useIsAuthorized();
  const { isUserDataConfirmed } = useUserAccess();
  const createMutation = useCreateRaffleMutation();
  const cancelCreateMutation = useCancelRaffleCreateMutation();
  const createAccessQuery = useRaffleCreateAdvertisingQuery({
    enabled: isAuthorized && isUserDataConfirmed,
  });
  const myRaffleQuery = useMyRaffleQuery({ enabled: isAuthorized && isUserDataConfirmed });
  const { deleteMyMutation } = useMyRaffleMutations();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [form, setForm] = useState<CreateRaffleFormState>(INITIAL_CREATE_RAFFLE_FORM);
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const stepId = CREATE_RAFFLE_WIZARD_STEPS[stepIndex];
  const stepCopy = resolveCreateRaffleWizardStepCopy(stepId);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === CREATE_RAFFLE_WIZARD_STEPS.length - 1;
  const isSubmitting = createMutation.isPending;
  const existingRaffle = myRaffleQuery.data?.raffle ?? null;
  const blockNotice = useMemo(
    () => resolveCreateRaffleBlockNotice(existingRaffle),
    [existingRaffle],
  );
  const isCreateBlocked = Boolean(blockNotice);
  const needsPaidUnlock =
    !isCreateBlocked && createAccessQuery.data?.canOpenForm !== true;
  const isWithdrawing = deleteMyMutation.isPending;
  const isCancelling = cancelCreateMutation.isPending;
  const wizardActionsDisabled = isSubmitting || isWithdrawing || isCancelling || isCreateBlocked;

  useFocusEffect(
    useCallback(() => {
      setErrorMessage("");
    }, []),
  );

  const resetWizard = () => {
    setForm(INITIAL_CREATE_RAFFLE_FORM);
    setStepIndex(0);
    setErrorMessage("");
  };

  const requestDiscard = (onConfirm: () => void) => {
    if (!isCreateRaffleFormDirty(form) && stepIndex === 0) {
      onConfirm();
      return;
    }
    Alert.alert(CREATE_RAFFLE_MODAL_UI.DISCARD_TITLE, CREATE_RAFFLE_MODAL_UI.DISCARD_MESSAGE, [
      { text: CREATE_RAFFLE_MODAL_UI.DISCARD_KEEP, style: "cancel" },
      {
        text: CREATE_RAFFLE_MODAL_UI.DISCARD_CONFIRM,
        style: "destructive",
        onPress: () => {
          resetWizard();
          onConfirm();
        },
      },
    ]);
  };

  const goNext = () => {
    if (isCreateBlocked) {
      return;
    }
    const stepError = validateCreateRaffleFormStep(stepId, form);
    if (stepError) {
      setErrorMessage(stepError);
      return;
    }
    setErrorMessage("");
    setStepIndex((prev) => Math.min(prev + 1, CREATE_RAFFLE_WIZARD_STEPS.length - 1));
  };

  const handleWithdraw = () => {
    if (!existingRaffle?._id || !blockNotice?.canWithdraw) {
      return;
    }

    Alert.alert(
      CREATE_RAFFLE_MODAL_UI.WITHDRAW_CONFIRM_TITLE,
      CREATE_RAFFLE_MODAL_UI.WITHDRAW_CONFIRM,
      [
        { text: CREATE_RAFFLE_MODAL_UI.BTN_CANCEL, style: "cancel" },
        {
          text: CREATE_RAFFLE_MODAL_UI.BTN_WITHDRAW,
          style: "destructive",
          onPress: () => {
            void runWithdraw(existingRaffle._id);
          },
        },
      ],
    );
  };

  const runWithdraw = async (raffleId: string) => {
    try {
      setErrorMessage("");
      await deleteMyMutation.mutateAsync(raffleId);
      resetWizard();
      router.replace("/hub/advertising");
    } catch (error) {
      setErrorMessage(formatApiErrorMessage(error, API_CLIENT_UI.DELETE_RAFFLE_FALLBACK));
    }
  };

  const navigateToAdvertising = () => {
    router.replace("/hub/advertising");
  };

  const runCancelCreate = async () => {
    try {
      setErrorMessage("");
      const hasPaidUnlock = createAccessQuery.data?.hasPaidUnlock === true;
      if (hasPaidUnlock) {
        await cancelCreateMutation.mutateAsync();
      }
      resetWizard();
      navigateToAdvertising();
    } catch (error) {
      setErrorMessage(formatApiErrorMessage(error, API_CLIENT_UI.CANCEL_RAFFLE_CREATE_FALLBACK));
    }
  };

  const handleCancel = () => {
    if (blockNotice?.canWithdraw && existingRaffle?._id) {
      Alert.alert(
        CREATE_RAFFLE_MODAL_UI.WITHDRAW_CONFIRM_TITLE,
        CREATE_RAFFLE_MODAL_UI.WITHDRAW_CONFIRM,
        [
          { text: CREATE_RAFFLE_MODAL_UI.BTN_CANCEL, style: "cancel" },
          {
            text: CREATE_RAFFLE_MODAL_UI.BTN_WITHDRAW,
            style: "destructive",
            onPress: () => {
              void runWithdraw(String(existingRaffle._id));
            },
          },
        ],
      );
      return;
    }

    const hasPaidUnlock = createAccessQuery.data?.hasPaidUnlock === true;
    const pricePoints = createAccessQuery.data?.pricePoints ?? 3_000;
    const shouldConfirmDiscard = isCreateRaffleFormDirty(form) || stepIndex > 0;

    const confirmCancel = () => {
      void runCancelCreate();
    };

    if (hasPaidUnlock) {
      Alert.alert(
        CREATE_RAFFLE_MODAL_UI.CANCEL_CREATE_TITLE,
        shouldConfirmDiscard
          ? `${CREATE_RAFFLE_MODAL_UI.CANCEL_CREATE_MESSAGE(pricePoints)}\n\n${CREATE_RAFFLE_MODAL_UI.DISCARD_MESSAGE}`
          : CREATE_RAFFLE_MODAL_UI.CANCEL_CREATE_MESSAGE(pricePoints),
        [
          { text: CREATE_RAFFLE_MODAL_UI.DISCARD_KEEP, style: "cancel" },
          {
            text: CREATE_RAFFLE_MODAL_UI.CANCEL_CREATE_CONFIRM,
            style: "destructive",
            onPress: confirmCancel,
          },
        ],
      );
      return;
    }

    requestDiscard(navigateToAdvertising);
  };

  const goBack = () => {
    setErrorMessage("");
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (isCreateBlocked) {
      return;
    }

    setErrorMessage("");

    const validationError = validateCreateRaffleForm(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await createMutation.mutateAsync(buildCreateRaffleSubmitBody(form));
      resetWizard();
      navigateToAdvertising();
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
      onOverviewPress={() =>
        requestDiscard(() => {
          setNavSheetVisible(false);
          router.replace("/(tabs)/me");
        })
      }
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

  if (createAccessQuery.isPending) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <ActivityIndicator color={theme.colors.action} />
        </View>
        {hubChrome}
      </>
    );
  }

  if (needsPaidUnlock) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>
            <ProfileMobileSectionToggle
              activeLabel={MY_PROFILE_PAGE_UI.TAB_CREATE_RAFFLE}
              onPress={() => setNavSheetVisible(true)}
            />
          </View>
          <Text style={styles.state}>{CREATE_RAFFLE_PAGE_UI.UNLOCK_REQUIRED}</Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push("/hub/advertising")}
          >
            <Text style={styles.loginButtonText}>{CREATE_RAFFLE_PAGE_UI.GO_TO_ADVERTISING}</Text>
          </Pressable>
        </View>
        {hubChrome}
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={resolveListStyle([
          styles.container,
          scrollEnabled ? centeredContentStyle : null,
        ])}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel={CREATE_RAFFLE_MODAL_UI.ARIA_DIALOG}
      >
        <View style={styles.header}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_CREATE_RAFFLE}
            onPress={() => setNavSheetVisible(true)}
          />
        </View>

        <CreateRaffleWizardProgress stepIndex={stepIndex} />

        <View style={styles.stepHeadline}>
          <Text style={styles.stepTitle}>{stepCopy.title}</Text>
          <Text style={styles.stepSubtitle}>{stepCopy.subtitle}</Text>
        </View>

        {isFirstStep && blockNotice ? (
          <CreateRaffleBlockNotice
            message={blockNotice.message}
            canWithdraw={blockNotice.canWithdraw}
            isWithdrawing={isWithdrawing}
            onWithdraw={handleWithdraw}
          />
        ) : null}

        <CreateRaffleFormBody
          form={form}
          onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onMediaTypeChange={(prizeMediaType: PrizeMediaType) =>
            setForm((prev) => applyCreateRaffleMediaTypeChange(prev, prizeMediaType))
          }
          isSubmitting={wizardActionsDisabled}
          hintText={isLastStep ? CREATE_RAFFLE_MODAL_UI.HINT : null}
          errorMessage={errorMessage}
          step={stepId}
          showFooter={false}
        />

        <View style={styles.wizardFooter}>
          {isFirstStep ? (
            <Pressable
              style={[styles.wizardSecondaryBtn, styles.wizardCancelBtn]}
              onPress={handleCancel}
              disabled={isSubmitting || isWithdrawing || isCancelling}
            >
              <Text style={styles.wizardSecondaryBtnText}>
                {CREATE_RAFFLE_MODAL_UI.BTN_CANCEL}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.wizardSecondaryBtn}
              onPress={goBack}
              disabled={isSubmitting || isWithdrawing || isCancelling}
            >
              <Text style={styles.wizardSecondaryBtnText}>{CREATE_RAFFLE_MODAL_UI.BTN_BACK}</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.wizardPrimaryBtn, wizardActionsDisabled && styles.submitDisabled]}
            onPress={() => {
              if (isLastStep) {
                void handleSubmit();
                return;
              }
              goNext();
            }}
            disabled={wizardActionsDisabled}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.onContrast} />
            ) : (
              <Text style={styles.wizardPrimaryBtnText}>
                {isLastStep ? CREATE_RAFFLE_MODAL_UI.SUBMIT : CREATE_RAFFLE_MODAL_UI.BTN_NEXT}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
      {hubChrome}
    </>
  );
};
