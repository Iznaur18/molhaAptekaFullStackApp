import { Fragment } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";

import type { PendingInstallmentProgram } from "@/entities/installment/api/installmentStaffApi";
import { INSTALLMENT_UI } from "@/shared/config";
import { useInstallmentModerationPageStyles } from "@/shared/theme/installmentModerationPageStyles";

type InstallmentModerationQueueCardProps = {
  program: PendingInstallmentProgram;
  isBusy: boolean;
  rejectComment: string;
  onRejectCommentChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
};

const resolvePartyDisplayName = (
  party: { userName?: string | null; email?: string | null } | null | undefined,
) => {
  if (!party) {
    return "—";
  }
  return party.userName?.trim() || party.email?.trim() || "—";
};

const resolveSellerId = (program: PendingInstallmentProgram) =>
  program.seller?._id ?? program.sellerId ?? null;

export const InstallmentModerationQueueCard = ({
  program,
  isBusy,
  rejectComment,
  onRejectCommentChange,
  onApprove,
  onReject,
}: InstallmentModerationQueueCardProps) => {
  const router = useRouter();
  const styles = useInstallmentModerationPageStyles();
  const productId = String(program.productId);
  const sellerId = resolveSellerId(program);
  const sellerDisplayName = resolvePartyDisplayName(program.seller);
  const buyers = program.buyers ?? [];

  const handleProfilePress = (userId: string) => {
    router.push({ pathname: "/user/[id]", params: { id: userId } });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{program.productName ?? productId}</Text>

      {sellerId ? (
        <View style={styles.sellerRow}>
          <Text style={styles.sellerLabel}>{INSTALLMENT_UI.SELLER_LABEL}: </Text>
          <Pressable
            onPress={() => handleProfilePress(sellerId)}
            accessibilityRole="link"
            accessibilityLabel={INSTALLMENT_UI.SELLER_PROFILE_ARIA(sellerDisplayName)}
          >
            <Text style={styles.sellerLink}>{sellerDisplayName}</Text>
          </Pressable>
        </View>
      ) : null}

      {buyers.length > 0 ? (
        <View style={styles.sellerRow}>
          <Text style={styles.sellerLabel}>
            {buyers.length > 1 ? INSTALLMENT_UI.BUYERS_LABEL : INSTALLMENT_UI.BUYER_LABEL}:{" "}
          </Text>
          {buyers.map((buyer, index) => {
            const buyerDisplayName = resolvePartyDisplayName(buyer);

            return (
              <Fragment key={buyer._id}>
                {index > 0 ? <Text style={styles.sellerLabel}>, </Text> : null}
                <Pressable
                  onPress={() => handleProfilePress(buyer._id)}
                  accessibilityRole="link"
                  accessibilityLabel={INSTALLMENT_UI.BUYER_PROFILE_ARIA(buyerDisplayName)}
                >
                  <Text style={styles.sellerLink}>{buyerDisplayName}</Text>
                </Pressable>
              </Fragment>
            );
          })}
        </View>
      ) : null}

      <View style={styles.plans}>
        {(program.plans ?? []).map((plan) => (
          <View key={plan._id ?? `${plan.title}-${plan.monthsCount}`} style={styles.planPill}>
            <Text style={styles.planPillText}>
              {plan.title}: {plan.monthsCount} мес × {plan.monthlyAmountRub} ₽
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.fieldLabel}>
        <Text>{INSTALLMENT_UI.MODERATION_REJECT_COMMENT}</Text>
        <TextInput
          style={styles.textarea}
          multiline
          value={rejectComment}
          onChangeText={onRejectCommentChange}
          editable={!isBusy}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionReject, isBusy && styles.actionDisabled]}
          disabled={isBusy}
          onPress={onReject}
        >
          <Text style={styles.actionRejectText}>
            {isBusy ? INSTALLMENT_UI.ACTION_PENDING : INSTALLMENT_UI.MODERATION_REJECT}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.actionApprove, isBusy && styles.actionDisabled]}
          disabled={isBusy}
          onPress={onApprove}
        >
          <Text style={styles.actionApproveText}>
            {isBusy ? INSTALLMENT_UI.ACTION_PENDING : INSTALLMENT_UI.MODERATION_APPROVE}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
