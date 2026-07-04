import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";

import type { InstallmentDispute } from "@/entities/installment/api/installmentStaffApi";
import { INSTALLMENT_UI } from "@/shared/config";
import { useInstallmentDisputesPageStyles } from "@/shared/theme/installmentDisputesPageStyles";

type InstallmentDisputesQueueCardProps = {
  dispute: InstallmentDispute;
  isBusy: boolean;
  resolutionNote: string;
  partialRefundRub: string;
  onResolutionNoteChange: (value: string) => void;
  onPartialRefundChange: (value: string) => void;
  onResolve: (action: string) => void;
};

const resolvePartyDisplayName = (
  party: { userName?: string | null; email?: string | null } | null | undefined,
) => {
  if (!party) {
    return "—";
  }
  return party.userName?.trim() || party.email?.trim() || "—";
};

const renderPartyRow = (
  label: string,
  party: { _id: string; userName?: string | null; email?: string | null } | null | undefined,
  ariaLabel: (name: string) => string,
  styles: ReturnType<typeof useInstallmentDisputesPageStyles>,
  onPress: (userId: string) => void,
) => {
  if (!party?._id) {
    return null;
  }

  const displayName = resolvePartyDisplayName(party);

  return (
    <View style={styles.partyRow}>
      <Text style={styles.partyLabel}>{label}: </Text>
      <Pressable
        onPress={() => onPress(party._id)}
        accessibilityRole="link"
        accessibilityLabel={ariaLabel(displayName)}
      >
        <Text style={styles.partyLink}>{displayName}</Text>
      </Pressable>
    </View>
  );
};

export const InstallmentDisputesQueueCard = ({
  dispute,
  isBusy,
  resolutionNote,
  partialRefundRub,
  onResolutionNoteChange,
  onPartialRefundChange,
  onResolve,
}: InstallmentDisputesQueueCardProps) => {
  const router = useRouter();
  const styles = useInstallmentDisputesPageStyles();

  const handleProfilePress = (userId: string) => {
    router.push({ pathname: "/user/[id]", params: { id: userId } });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {dispute.productName?.trim() || INSTALLMENT_UI.DISPUTE_CONTRACT_LABEL}
      </Text>
      <Text style={styles.cardMeta}>
        {dispute.contractId}
        {"\n"}
        {INSTALLMENT_UI.DISPUTE_REASON_LABEL}: {dispute.reason}
      </Text>

      {renderPartyRow(
        INSTALLMENT_UI.SELLER_LABEL,
        dispute.seller,
        INSTALLMENT_UI.SELLER_PROFILE_ARIA,
        styles,
        handleProfilePress,
      )}
      {renderPartyRow(
        INSTALLMENT_UI.BUYER_LABEL,
        dispute.buyer,
        INSTALLMENT_UI.BUYER_PROFILE_ARIA,
        styles,
        handleProfilePress,
      )}

      <View style={styles.fieldLabel}>
        <Text>{INSTALLMENT_UI.DISPUTE_RESOLVE_NOTE}</Text>
        <TextInput
          style={styles.textarea}
          multiline
          value={resolutionNote}
          onChangeText={onResolutionNoteChange}
          editable={!isBusy}
        />
      </View>

      <View style={styles.fieldLabel}>
        <Text>{INSTALLMENT_UI.DISPUTE_PARTIAL_AMOUNT}</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          value={partialRefundRub}
          onChangeText={onPartialRefundChange}
          editable={!isBusy}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionPrimary, isBusy && styles.actionDisabled]}
          disabled={isBusy}
          onPress={() => onResolve("close")}
        >
          <Text style={styles.actionPrimaryText}>{INSTALLMENT_UI.DISPUTE_ACTION_CLOSE}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionCancel, isBusy && styles.actionDisabled]}
          disabled={isBusy}
          onPress={() => onResolve("cancel")}
        >
          <Text style={styles.actionPrimaryText}>{INSTALLMENT_UI.DISPUTE_ACTION_CANCEL}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionSecondary, isBusy && styles.actionDisabled]}
          disabled={isBusy}
          onPress={() => onResolve("adjust_schedule")}
        >
          <Text style={styles.actionSecondaryText}>{INSTALLMENT_UI.DISPUTE_ACTION_ADJUST}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionSecondary, isBusy && styles.actionDisabled]}
          disabled={isBusy}
          onPress={() => onResolve("partial_refund")}
        >
          <Text style={styles.actionSecondaryText}>{INSTALLMENT_UI.DISPUTE_ACTION_REFUND}</Text>
        </Pressable>
      </View>
    </View>
  );
};
