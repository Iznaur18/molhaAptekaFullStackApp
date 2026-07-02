import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
  INSTALLMENT_PLANS_MAX,
} from "@/entities/installment/model/programConstants";
import {
  INSTALLMENT_MODERATION_APPROVED,
  INSTALLMENT_MODERATION_PENDING,
  INSTALLMENT_MODERATION_REJECTED,
} from "@/entities/installment/model/moderationConstants";
import { useInstallmentMutations } from "@/entities/installment/model/useInstallmentMutations";
import { useProductInstallmentProgramQuery } from "@/entities/installment/model/useProductInstallmentProgramQuery";
import {
  validateInstallmentProgramPlans,
  type InstallmentProgramPlanDraft,
} from "@/entities/installment/lib/validateInstallmentProgramPlans";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useInstallmentProgramModalStyles } from "@/shared/theme/sellerFlowStyles";

const DEFAULT_PLAN_TITLE = "Стандарт";

const createEmptyPlan = (planNumber = 1): InstallmentProgramPlanDraft => ({
  title: planNumber <= 1 ? DEFAULT_PLAN_TITLE : `План ${planNumber}`,
  monthsCount: 3,
  monthlyAmountRub: INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
  firstPaymentRequiredNow: true,
});

type InstallmentProgramModalProps = {
  visible: boolean;
  productId: string;
  productName?: string;
  onClose: () => void;
  onSaved?: (productPatch?: Record<string, unknown>) => void;
};

export const InstallmentProgramModal = ({
  visible,
  productId,
  productName = "",
  onClose,
  onSaved,
}: InstallmentProgramModalProps) => {
  const styles = useInstallmentProgramModalStyles();
  const theme = useAppTheme();
  const { upsertProgramMutation } = useInstallmentMutations();
  const [isEnabled, setIsEnabled] = useState(true);
  const [plans, setPlans] = useState<InstallmentProgramPlanDraft[]>([createEmptyPlan()]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const programQuery = useProductInstallmentProgramQuery(productId, visible && Boolean(productId));
  const isLoading = programQuery.isLoading;
  const isSubmitting = upsertProgramMutation.isPending;
  const programModerationStatus = programQuery.data?.moderationStatus;

  const moderationHint =
    programModerationStatus === INSTALLMENT_MODERATION_PENDING
      ? INSTALLMENT_UI.PROGRAM_MODAL_PENDING_HINT
      : programModerationStatus === INSTALLMENT_MODERATION_REJECTED
        ? INSTALLMENT_UI.PROGRAM_MODAL_REJECTED_HINT
        : programModerationStatus === INSTALLMENT_MODERATION_APPROVED &&
            programQuery.data?.isEnabled
          ? INSTALLMENT_UI.PROGRAM_MODAL_APPROVED_HINT
          : null;

  useEffect(() => {
    if (!visible) {
      setError("");
      setSuccess("");
      return;
    }
    if (isLoading) {
      return;
    }

    const program = programQuery.data;
    if (program) {
      setIsEnabled(program.isEnabled !== false);
      setPlans(
        program.plans?.length
          ? program.plans.map((plan) => ({
              title: plan.title ?? DEFAULT_PLAN_TITLE,
              monthsCount: Number(plan.monthsCount) || 3,
              monthlyAmountRub: Number(plan.monthlyAmountRub) || INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
              firstPaymentRequiredNow: plan.firstPaymentRequiredNow !== false,
            }))
          : [createEmptyPlan()],
      );
      return;
    }

    setIsEnabled(true);
    setPlans([createEmptyPlan()]);
  }, [isLoading, programQuery.data, visible]);

  const updatePlan = useCallback((index: number, patch: Partial<InstallmentProgramPlanDraft>) => {
    setPlans((prev) =>
      prev.map((plan, planIndex) => (planIndex === index ? { ...plan, ...patch } : plan)),
    );
  }, []);

  const addPlan = () => {
    if (plans.length >= INSTALLMENT_PLANS_MAX) {
      return;
    }
    setPlans((prev) => [...prev, createEmptyPlan(prev.length + 1)]);
  };

  const removePlan = (index: number) => {
    if (plans.length <= 1) {
      return;
    }
    setPlans((prev) => prev.filter((_, planIndex) => planIndex !== index));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const validation = validateInstallmentProgramPlans(plans);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    try {
      const result = await upsertProgramMutation.mutateAsync({
        productId,
        body: {
          isEnabled,
          plans: plans.map((plan) => ({
            title: String(plan.title ?? "").trim(),
            monthsCount: Number(plan.monthsCount),
            monthlyAmountRub: Number(plan.monthlyAmountRub),
            firstPaymentRequiredNow: plan.firstPaymentRequiredNow !== false,
          })),
        },
      });

      const successMessage =
        typeof result?.message === "string" && result.message.trim()
          ? result.message.trim()
          : INSTALLMENT_UI.PROGRAM_MODAL_SUCCESS;
      setSuccess(successMessage);
      onSaved?.(result.product);
      const sentToModeration = successMessage.toLowerCase().includes("модерац");
      if (!sentToModeration) {
        onClose();
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : INSTALLMENT_UI.ERROR_GENERIC);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === "web" ? "none" : "slide"}
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {INSTALLMENT_UI.PROGRAM_MODAL_TITLE}
              {productName ? `: ${productName}` : ""}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={INSTALLMENT_UI.PROGRAM_MODAL_CLOSE}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={theme.colors.action} />
            </View>
          ) : (
            <ScrollView
              style={styles.bodyScroll}
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
            >
              {error ? (
                <Text style={styles.error} accessibilityRole="alert">
                  {error}
                </Text>
              ) : null}
              {success ? (
                <Text style={styles.success} accessibilityRole="text">
                  {success}
                </Text>
              ) : null}
              {moderationHint ? <Text style={styles.info}>{moderationHint}</Text> : null}

              <View style={styles.enabledRow}>
                <Text style={styles.enabledLabel}>{INSTALLMENT_UI.PROGRAM_MODAL_ENABLED}</Text>
                <Switch value={isEnabled} onValueChange={setIsEnabled} disabled={isSubmitting} />
              </View>

              {plans.map((plan, index) => {
                const monthsCount = Math.floor(Number(plan.monthsCount) || 0);
                const monthlyAmountRub = Math.floor(Number(plan.monthlyAmountRub) || 0);
                const totalRub = monthsCount * monthlyAmountRub;
                const isLast = index === plans.length - 1;

                return (
                  <View key={`plan-${index}`} style={[styles.planCard, isLast && styles.planCardLast]}>
                    <View style={styles.planHeader}>
                      <Text style={styles.planTitle}>
                        {INSTALLMENT_UI.PROGRAM_MODAL_PLAN_NUMBER(index + 1)}
                      </Text>
                      {plans.length > 1 ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => removePlan(index)}
                          disabled={isSubmitting}
                        >
                          <Text style={styles.planRemove}>{INSTALLMENT_UI.PROGRAM_MODAL_REMOVE_PLAN}</Text>
                        </Pressable>
                      ) : null}
                    </View>

                    <Text style={styles.fieldLabel}>{INSTALLMENT_UI.PROGRAM_MODAL_PLAN_TITLE}</Text>
                    <TextInput
                      style={styles.input}
                      value={String(plan.title ?? "")}
                      placeholder={INSTALLMENT_UI.PROGRAM_MODAL_PLAN_TITLE_PLACEHOLDER}
                      editable={!isSubmitting}
                      onChangeText={(value) => updatePlan(index, { title: value })}
                    />

                    <View style={styles.rowFields}>
                      <View style={styles.rowField}>
                        <Text style={styles.fieldLabel}>{INSTALLMENT_UI.PROGRAM_MODAL_MONTHS}</Text>
                        <TextInput
                          style={styles.input}
                          value={String(plan.monthsCount ?? "")}
                          keyboardType="number-pad"
                          editable={!isSubmitting}
                          onChangeText={(value) =>
                            updatePlan(index, { monthsCount: Number(value) || 0 })
                          }
                        />
                      </View>
                      <View style={styles.rowField}>
                        <Text style={styles.fieldLabel}>{INSTALLMENT_UI.PROGRAM_MODAL_MONTHLY}</Text>
                        <TextInput
                          style={styles.input}
                          value={String(plan.monthlyAmountRub ?? "")}
                          keyboardType="number-pad"
                          editable={!isSubmitting}
                          onChangeText={(value) =>
                            updatePlan(index, { monthlyAmountRub: Number(value) || 0 })
                          }
                        />
                      </View>
                    </View>

                    <Text style={styles.planTotal}>
                      {INSTALLMENT_UI.PROGRAM_MODAL_PLAN_TOTAL(formatPriceRub(totalRub))}
                    </Text>

                    <View style={styles.firstPaymentRow}>
                      <Switch
                        value={plan.firstPaymentRequiredNow !== false}
                        onValueChange={(value) =>
                          updatePlan(index, { firstPaymentRequiredNow: value })
                        }
                        disabled={isSubmitting}
                      />
                      <Text style={styles.firstPaymentLabel}>
                        {INSTALLMENT_UI.PROGRAM_MODAL_FIRST_NOW}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {plans.length < INSTALLMENT_PLANS_MAX ? (
                <Pressable
                  style={styles.addPlanButton}
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  onPress={addPlan}
                >
                  <Text style={styles.addPlanButtonText}>{INSTALLMENT_UI.PROGRAM_MODAL_ADD_PLAN}</Text>
                </Pressable>
              ) : (
                <Text style={styles.maxPlansHint}>
                  {INSTALLMENT_UI.PROGRAM_MODAL_MAX_PLANS(INSTALLMENT_PLANS_MAX)}
                </Text>
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <Pressable
              style={[styles.saveButton, isSubmitting && styles.buttonDisabled]}
              accessibilityRole="button"
              disabled={isSubmitting || isLoading}
              onPress={() => void handleSave()}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.onContrast} />
              ) : (
                <Text style={styles.saveButtonText}>{INSTALLMENT_UI.PROGRAM_MODAL_SAVE}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
