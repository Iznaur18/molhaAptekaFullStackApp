import { Text, View } from "react-native";

import {
  CREATE_RAFFLE_WIZARD_STEPS,
  resolveCreateRaffleWizardStepCopy,
  type CreateRaffleWizardStepId,
} from "@/features/create-raffle-page/lib/createRaffleWizardSteps";
import { CREATE_RAFFLE_MODAL_UI } from "@/shared/config";
import { useCreateRafflePageStyles } from "@/shared/theme/createRafflePageStyles";

type CreateRaffleWizardProgressProps = {
  stepIndex: number;
};

export const CreateRaffleWizardProgress = ({ stepIndex }: CreateRaffleWizardProgressProps) => {
  const styles = useCreateRafflePageStyles();

  return (
    <View
      style={styles.wizardProgress}
      accessibilityLabel={CREATE_RAFFLE_MODAL_UI.WIZARD_PROGRESS_ARIA}
    >
      <Text style={styles.wizardCaption}>
        {CREATE_RAFFLE_MODAL_UI.WIZARD_STEP_OF(stepIndex + 1, CREATE_RAFFLE_WIZARD_STEPS.length)}
      </Text>
      <View style={styles.wizardSteps}>
        {CREATE_RAFFLE_WIZARD_STEPS.map((stepId, index) => {
          const copy = resolveCreateRaffleWizardStepCopy(stepId as CreateRaffleWizardStepId);
          const isActive = index === stepIndex;
          const isComplete = index < stepIndex;

          return (
            <View
              key={stepId}
              style={[
                styles.wizardStep,
                isActive && styles.wizardStepActive,
                isComplete && styles.wizardStepComplete,
              ]}
              accessibilityState={{ selected: isActive }}
            >
              <View
                style={[
                  styles.wizardStepIndex,
                  isActive && styles.wizardStepIndexActive,
                  isComplete && styles.wizardStepIndexComplete,
                ]}
              >
                <Text
                  style={[
                    styles.wizardStepIndexText,
                    isActive && styles.wizardStepIndexTextActive,
                    isComplete && styles.wizardStepIndexTextComplete,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text style={styles.wizardStepLabel} numberOfLines={1}>
                {copy.shortLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
