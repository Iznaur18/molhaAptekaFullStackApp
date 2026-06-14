import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import {
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
} from "@/entities/installment/model/constants";
import { useInstallmentMutations } from "@/entities/installment/model/useInstallmentMutations";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatIsoDateTime, formatPriceRub } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useInstallmentContractCardStyles } from "@/shared/theme/accountFeatureStyles";

type InstallmentContractCardProps = {
  contract: InstallmentContract;
  role: "buyer" | "seller";
  onProductPress?: (productId: string) => void;
};

export const InstallmentContractCard = ({
  contract,
  role,
  onProductPress,
}: InstallmentContractCardProps) => {
  const theme = useAppTheme();
  const styles = useInstallmentContractCardStyles();
  const { markPaidMutation, confirmPaymentMutation, rejectPaymentMutation } =
    useInstallmentMutations();
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const productId = contract.product?._id;
  const productName = contract.product?.productName ?? "Товар";
  const counterparty =
    role === "buyer" ? contract.seller?.userName : contract.buyer?.userName;
  const statusLabel =
    INSTALLMENT_UI.CONTRACT_STATUS_LABEL[contract.status ?? ""] ?? contract.status ?? "—";

  const runAction = async (key: string, action: () => Promise<unknown>) => {
    setPendingKey(key);
    setErrorMessage("");
    try {
      await action();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : INSTALLMENT_UI.ERROR_GENERIC);
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <View style={styles.card}>
      {productId && onProductPress ? (
        <Pressable onPress={() => onProductPress(productId)}>
          <Text style={styles.productLink}>{productName}</Text>
        </Pressable>
      ) : (
        <Text style={styles.product}>{productName}</Text>
      )}

      <Text style={styles.meta}>
        {role === "buyer" ? INSTALLMENT_UI.SELLER_LABEL : INSTALLMENT_UI.BUYER_LABEL}:{" "}
        {counterparty ?? "—"}
      </Text>
      <Text style={styles.meta}>
        {INSTALLMENT_UI.CONTRACT_STATUS}: {statusLabel}
      </Text>
      <Text style={styles.meta}>
        {INSTALLMENT_UI.CONTRACT_PAID}: {formatPriceRub(contract.paidAmountRub)} /{" "}
        {formatPriceRub(contract.totalAmountRub)}
      </Text>

      <Text style={styles.paymentsTitle}>{INSTALLMENT_UI.PAYMENTS_HEADING}</Text>
      {(contract.payments ?? []).map((payment, index) => {
        const paymentIndex = payment.index ?? index;
        const status = payment.status ?? "";
        const statusLabelPayment = INSTALLMENT_UI.PAYMENT_STATUS_LABEL[status] ?? status;
        const canBuyerMark =
          role === "buyer" &&
          (status === INSTALLMENT_PAYMENT_STATUS_DUE ||
            status === INSTALLMENT_PAYMENT_STATUS_OVERDUE);
        const canSellerConfirm =
          role === "seller" && status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION;
        const actionKey = `${contract._id}:${paymentIndex}`;

        return (
          <View key={`${contract._id}-${paymentIndex}`} style={styles.paymentRow}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentText}>
                {formatPriceRub(payment.amountRub)} · {statusLabelPayment}
              </Text>
              {payment.dueAt ? (
                <Text style={styles.paymentDue}>{formatIsoDateTime(payment.dueAt)}</Text>
              ) : null}
            </View>

            {canBuyerMark ? (
              <Pressable
                style={styles.actionButton}
                disabled={pendingKey === actionKey}
                onPress={() => {
                  void runAction(actionKey, () =>
                    markPaidMutation.mutateAsync({
                      contractId: contract._id,
                      paymentIndex,
                    }),
                  );
                }}
              >
                {pendingKey === actionKey ? (
                  <ActivityIndicator size="small" color={theme.colors.onContrast} />
                ) : (
                  <Text style={styles.actionText}>{INSTALLMENT_UI.MARK_PAID}</Text>
                )}
              </Pressable>
            ) : null}

            {canSellerConfirm ? (
              <View style={styles.sellerActions}>
                <Pressable
                  style={styles.actionButton}
                  disabled={pendingKey === `${actionKey}:confirm`}
                  onPress={() => {
                    void runAction(`${actionKey}:confirm`, () =>
                      confirmPaymentMutation.mutateAsync({
                        contractId: contract._id,
                        paymentIndex,
                      }),
                    );
                  }}
                >
                  <Text style={styles.actionText}>{INSTALLMENT_UI.CONFIRM_PAYMENT}</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.rejectButton]}
                  disabled={pendingKey === `${actionKey}:reject`}
                  onPress={() => {
                    void runAction(`${actionKey}:reject`, () =>
                      rejectPaymentMutation.mutateAsync({
                        contractId: contract._id,
                        paymentIndex,
                      }),
                    );
                  }}
                >
                  <Text style={styles.rejectText}>{INSTALLMENT_UI.REJECT_PAYMENT}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        );
      })}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};
