import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useMyRaffleMutations } from "@/entities/raffle/model/useMyRaffleMutations";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { useRaffleStaffMutations } from "@/entities/raffle/model/useRaffleStaffMutations";
import {
  applyCreateRaffleMediaTypeChange,
  buildCreateRaffleSubmitBody,
  formFromRaffle,
  INITIAL_CREATE_RAFFLE_FORM,
  type CreateRaffleFormState,
  type PrizeMediaType,
  validateCreateRaffleForm,
} from "@/features/create-raffle-page/lib/createRaffleForm";
import { CreateRaffleFormBody } from "@/features/create-raffle-page/ui/CreateRaffleFormBody";
import { API_CLIENT_UI, CREATE_RAFFLE_MODAL_UI } from "@/shared/config";
import { useCreateRaffleModalStyles } from "@/shared/theme/createRafflePageStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

type CreateRaffleModalProps = {
  visible: boolean;
  raffleToEdit: RaffleFromApi | null;
  useStaffApi?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const CreateRaffleModal = ({
  visible,
  raffleToEdit,
  useStaffApi = false,
  onClose,
  onSuccess,
}: CreateRaffleModalProps) => {
  const styles = useCreateRaffleModalStyles();
  const { patchMyMutation } = useMyRaffleMutations();
  const { patchStaffMutation } = useRaffleStaffMutations();
  const [form, setForm] = useState<CreateRaffleFormState>(INITIAL_CREATE_RAFFLE_FORM);
  const [errorMessage, setErrorMessage] = useState("");

  const isEdit = raffleToEdit != null;
  const isSubmitting = patchMyMutation.isPending || patchStaffMutation.isPending;

  useEffect(() => {
    if (!visible) {
      return;
    }
    setForm(isEdit && raffleToEdit ? formFromRaffle(raffleToEdit) : INITIAL_CREATE_RAFFLE_FORM);
    setErrorMessage("");
  }, [visible, isEdit, raffleToEdit]);

  const modalTitle = isEdit ? CREATE_RAFFLE_MODAL_UI.TITLE_EDIT : CREATE_RAFFLE_MODAL_UI.TITLE;
  const ariaDialog = isEdit
    ? CREATE_RAFFLE_MODAL_UI.ARIA_DIALOG_EDIT
    : CREATE_RAFFLE_MODAL_UI.ARIA_DIALOG;
  const submitLabel = isSubmitting
    ? isEdit
      ? CREATE_RAFFLE_MODAL_UI.SUBMIT_EDIT_LOADING
      : CREATE_RAFFLE_MODAL_UI.SUBMIT_LOADING
    : isEdit
      ? CREATE_RAFFLE_MODAL_UI.SUBMIT_EDIT
      : CREATE_RAFFLE_MODAL_UI.SUBMIT;

  const hintText = useMemo(() => {
    if (!isEdit) {
      return CREATE_RAFFLE_MODAL_UI.HINT;
    }
    if (raffleToEdit?.status === "active") {
      return CREATE_RAFFLE_MODAL_UI.HINT_EDIT_ACTIVE;
    }
    return null;
  }, [isEdit, raffleToEdit?.status]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = async () => {
    const validationError = validateCreateRaffleForm(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!isEdit || !raffleToEdit?._id) {
      return;
    }

    setErrorMessage("");
    try {
      const body = buildCreateRaffleSubmitBody(form);
      if (useStaffApi) {
        await patchStaffMutation.mutateAsync({ raffleId: String(raffleToEdit._id), body });
      } else {
        await patchMyMutation.mutateAsync({ raffleId: String(raffleToEdit._id), body });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : API_CLIENT_UI.PATCH_RAFFLE_FALLBACK,
      );
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <ModalSheetGradientBackdrop />
        <Pressable style={styles.backdropPressable} onPress={handleClose} accessibilityRole="button" />
        <View style={styles.card} accessibilityLabel={ariaDialog}>
          <View style={styles.header}>
            <Text style={styles.title}>{modalTitle}</Text>
            <Pressable
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel={CREATE_RAFFLE_MODAL_UI.ARIA_CLOSE}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <CreateRaffleFormBody
              form={form}
              onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              onMediaTypeChange={(prizeMediaType: PrizeMediaType) =>
                setForm((prev) => applyCreateRaffleMediaTypeChange(prev, prizeMediaType))
              }
              isSubmitting={isSubmitting}
              hintText={hintText}
              errorMessage={errorMessage}
              submitLabel={submitLabel}
              onSubmit={() => {
                void handleSubmit();
              }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
