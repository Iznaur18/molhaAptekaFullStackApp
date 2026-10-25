import {
  isInnLengthValidForLegalForm,
  isValidInn,
  SAFE_DEAL_INN_INVALID_MESSAGE,
  SELLER_INN_LENGTH_BY_LEGAL_FORM,
  SELLER_LEGAL_FORM_IP,
  SELLER_LEGAL_FORM_LABELS_RU,
  SELLER_LEGAL_FORM_OOO,
  SELLER_LEGAL_FORMS,
} from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import {
  useMySellerSafeDealQuery,
  useSubmitSellerSafeDealMutation,
} from "@/entities/seller-safe-deal/model/useSellerSafeDeal";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountScrollBody } from "@/features/profile-tab/ui/ProfileAccountScrollBody";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { AUTH_UI, MY_PROFILE_PAGE_UI, SAFE_DEAL_UI } from "@/shared/config";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useSafeDealPageStyles } from "@/shared/theme/safeDealPageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type SafeDealStatus = "none" | "pending" | "approved" | "rejected";

const STATUS_LABEL: Record<SafeDealStatus, string> = {
  none: SAFE_DEAL_UI.STATUS_NONE,
  pending: SAFE_DEAL_UI.STATUS_PENDING,
  approved: SAFE_DEAL_UI.STATUS_APPROVED,
  rejected: SAFE_DEAL_UI.STATUS_REJECTED,
};

const INN_HINT_BY_LEGAL_FORM: Record<string, string> = {
  [SELLER_LEGAL_FORM_IP]: SAFE_DEAL_UI.HINT_INN_IP,
  [SELLER_LEGAL_FORM_OOO]: SAFE_DEAL_UI.HINT_INN_OOO,
};

const INN_PLACEHOLDER_BY_LEGAL_FORM: Record<string, string> = {
  [SELLER_LEGAL_FORM_IP]: SAFE_DEAL_UI.INN_PLACEHOLDER_IP,
  [SELLER_LEGAL_FORM_OOO]: SAFE_DEAL_UI.INN_PLACEHOLDER_OOO,
};

const LEGAL_FORM_LABELS = SELLER_LEGAL_FORM_LABELS_RU as Record<string, string>;

/** Самая длинная форма — 12 цифр у ИП; на неё и режем ввод. */
const INN_MAX_LENGTH = Math.max(
  ...Object.values(SELLER_INN_LENGTH_BY_LEGAL_FORM as Record<string, number>),
);

/** Пробелы и дефисы из скопированной выписки чистим молча — это не ошибка ввода. */
export const normalizeSafeDealInnInput = (raw: string): string =>
  raw.replace(/\D/g, "").slice(0, INN_MAX_LENGTH);

/**
 * Ошибка ИНН до отправки. Ту же проверку делает сервер — здесь она нужна,
 * чтобы опечатка всплыла сразу, а не через сутки отказом модератора.
 */
export const resolveSafeDealInnError = (legalForm: string, inn: string): string => {
  if (!legalForm || !inn) return "";
  if (!isInnLengthValidForLegalForm(legalForm, inn)) {
    return INN_HINT_BY_LEGAL_FORM[legalForm] ?? "";
  }
  if (!isValidInn(inn)) {
    return SAFE_DEAL_INN_INVALID_MESSAGE;
  }
  return "";
};

/**
 * Подключение безопасной сделки — раздел профиля, паритет web `SafeDealPage`.
 * Формы «самозанятый» и «физлицо» нет намеренно: деньги через площадку
 * уходят только ИП и ООО.
 */
export const SafeDealPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useSafeDealPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const isAuthorized = useIsAuthorized();
  const safeDealQuery = useMySellerSafeDealQuery({ enabled: isAuthorized });
  const submitMutation = useSubmitSellerSafeDealMutation();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [form, setForm] = useState({ legalForm: "", inn: "" });
  const [error, setError] = useState("");

  const safeDeal = safeDealQuery.data;
  const status: SafeDealStatus = safeDeal?.moderationStatus ?? "none";
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isLocked = isPending || isApproved;

  // Переподача после отказа начинается с прежних данных: чаще всего править
  // надо одну цифру, а не вводить всё заново.
  useEffect(() => {
    if (!safeDeal) return;
    setForm({ legalForm: safeDeal.legalForm ?? "", inn: safeDeal.inn ?? "" });
  }, [safeDeal]);

  const innError = useMemo(
    () => resolveSafeDealInnError(form.legalForm, form.inn),
    [form.legalForm, form.inn],
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>{SAFE_DEAL_UI.LOGIN_HINT}</Text>
        <AppButton
          label={AUTH_UI.LOGIN_BUTTON}
          variant="primary"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    );
  }

  if (safeDealQuery.isPending) {
    return <ScreenLoadingState message={SAFE_DEAL_UI.LOADING} />;
  }

  if (safeDealQuery.isError) {
    return (
      <ScreenErrorState
        message={safeDealQuery.error.message}
        onRetry={() => void safeDealQuery.refetch()}
      />
    );
  }

  const isFieldsDisabled = isLocked || submitMutation.isPending;
  const canSubmit =
    !isLocked &&
    !submitMutation.isPending &&
    Boolean(form.legalForm) &&
    Boolean(form.inn) &&
    !innError;
  const innHint = form.legalForm
    ? (INN_HINT_BY_LEGAL_FORM[form.legalForm] ?? "")
    : SAFE_DEAL_UI.HINT_INN_EMPTY;

  const handleSubmit = async () => {
    setError("");
    try {
      await submitMutation.mutateAsync(form);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : SAFE_DEAL_UI.ERROR_GENERIC,
      );
    }
  };

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
        accessibilityLabel={SAFE_DEAL_UI.TITLE}
      >
        <View style={styles.root}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_SAFE_DEAL}
            onPress={() => setNavSheetVisible(true)}
          />

          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {SAFE_DEAL_UI.TITLE}
            </Text>
            <View
              style={[
                styles.status,
                status === "pending" && styles.statusPending,
                status === "approved" && styles.statusApproved,
                status === "rejected" && styles.statusRejected,
              ]}
            >
              <Text style={styles.statusText}>{STATUS_LABEL[status]}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.text}>{SAFE_DEAL_UI.INTRO}</Text>
            <Text style={styles.sectionTitle}>{SAFE_DEAL_UI.WHY_HEADING}</Text>
            {SAFE_DEAL_UI.WHY_ITEMS.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={[styles.text, { flex: 1 }]}>{item}</Text>
              </View>
            ))}
            {isApproved ? (
              <Text style={styles.approved}>{SAFE_DEAL_UI.APPROVED_HINT}</Text>
            ) : null}
            {status === "rejected" && safeDeal?.moderationComment ? (
              <Text style={styles.rejection} accessibilityRole="alert">
                {SAFE_DEAL_UI.REJECTION_REASON}: {safeDeal.moderationComment}
              </Text>
            ) : null}
          </View>

          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{SAFE_DEAL_UI.FIELD_LEGAL_FORM}</Text>
              {/* Вариантов два — две кнопки вместо выпадающего списка. */}
              <View
                style={styles.segment}
                accessibilityRole="radiogroup"
                accessibilityLabel={SAFE_DEAL_UI.LEGAL_FORM_ARIA}
              >
                {(SELLER_LEGAL_FORMS as readonly string[]).map((legalForm) => {
                  const active = form.legalForm === legalForm;
                  return (
                    <Pressable
                      key={legalForm}
                      style={[
                        styles.segmentItem,
                        active && styles.segmentItemActive,
                        isFieldsDisabled && styles.segmentItemDisabled,
                      ]}
                      disabled={isFieldsDisabled}
                      onPress={() => {
                        setForm((prev) => ({ ...prev, legalForm }));
                        setError("");
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{
                        checked: active,
                        disabled: isFieldsDisabled,
                      }}
                    >
                      <Text
                        style={[styles.segmentText, active && styles.segmentTextActive]}
                      >
                        {LEGAL_FORM_LABELS[legalForm] ?? legalForm}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{SAFE_DEAL_UI.FIELD_INN}</Text>
              <TextInput
                style={[
                  styles.input,
                  innError ? styles.inputInvalid : null,
                  isFieldsDisabled ? styles.inputDisabled : null,
                ]}
                value={form.inn}
                onChangeText={(raw) => {
                  setForm((prev) => ({ ...prev, inn: normalizeSafeDealInnInput(raw) }));
                  setError("");
                }}
                placeholder={
                  INN_PLACEHOLDER_BY_LEGAL_FORM[form.legalForm] ??
                  SAFE_DEAL_UI.INN_PLACEHOLDER_OOO
                }
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                inputMode="numeric"
                autoComplete="off"
                maxLength={INN_MAX_LENGTH}
                editable={!isFieldsDisabled}
                accessibilityLabel={SAFE_DEAL_UI.FIELD_INN}
              />
              <Text style={[styles.muted, innError ? styles.hintError : null]}>
                {innError || innHint}
              </Text>
            </View>

            <Text style={styles.muted}>{SAFE_DEAL_UI.LEGAL_NOTE}</Text>

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            {!isApproved ? (
              <AppButton
                label={
                  submitMutation.isPending
                    ? SAFE_DEAL_UI.SUBMITTING
                    : status === "rejected"
                      ? SAFE_DEAL_UI.RESUBMIT
                      : SAFE_DEAL_UI.SUBMIT
                }
                variant="primary"
                disabled={!canSubmit}
                onPress={() => void handleSubmit()}
              />
            ) : null}
            {isPending ? (
              <Text style={styles.muted}>{SAFE_DEAL_UI.PENDING_HINT}</Text>
            ) : null}
          </View>

          <Text style={styles.muted}>{SAFE_DEAL_UI.PRIVACY_NOTE}</Text>
        </View>
      </ProfileAccountScrollBody>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="safe-deal"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
