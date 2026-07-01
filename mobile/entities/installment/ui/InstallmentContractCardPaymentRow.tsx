import { Pressable, Text, View } from "react-native";

import type {
  InstallmentContract,
  InstallmentPayment,
} from "@/entities/installment/api/installmentApi";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useInstallmentContractCardChromeStyles } from "@/shared/theme/installmentContractCardChromeStyles";

type PaymentStatuses = {
  due: string;
  overdue: string;
  pendingConfirmation: string;
  paid: string;
};

type InstallmentContractCardPaymentRowProps = {
  payment: InstallmentPayment;
  paymentLabel: string;
  paymentStatuses: PaymentStatuses;
  role: "buyer" | "seller";
  isActiveContract: boolean;
  earlyPayoffPending: boolean;
  pendingKey: string | null;
  contract: InstallmentContract;
  canBuyerMarkPayment: (contract: InstallmentContract, payment: InstallmentPayment) => boolean;
  onMarkPaid: (paymentIndex: number) => void;
  onConfirmPayment: (paymentIndex: number) => void;
  onRejectPayment: (paymentIndex: number) => void;
  compact?: boolean;
};

export const InstallmentContractCardPaymentRow = ({
  payment,
  paymentLabel,
  paymentStatuses,
  role,
  isActiveContract,
  earlyPayoffPending,
  pendingKey,
  contract,
  canBuyerMarkPayment,
  onMarkPaid,
  onConfirmPayment,
  onRejectPayment,
  compact = false,
}: InstallmentContractCardPaymentRowProps) => {
  const styles = useInstallmentContractCardChromeStyles();
  const dueDate = payment.dueAt
    ? new Date(payment.dueAt).toLocaleDateString("ru-RU")
    : "—";
  const isOverdue = payment.status === paymentStatuses.overdue;
  const isPendingConfirmation = payment.status === paymentStatuses.pendingConfirmation;
  const isPaid = payment.status === paymentStatuses.paid;

  return (
    <View
      style={[
        styles.paymentRow,
        isPaid ? styles.paymentRowPaid : null,
        isOverdue ? styles.paymentRowOverdue : null,
        isPendingConfirmation ? styles.paymentRowPending : null,
      ]}
    >
      <View style={styles.paymentMain}>
        <Text style={styles.paymentAmount}>{formatPriceRub(payment.amountRub)}</Text>
        <Text style={styles.paymentMeta}>
          {INSTALLMENT_UI.PAYMENT_DUE} {dueDate}
          {!compact ? ` · ${paymentLabel}` : null}
        </Text>
        {compact ? (
          <Text
            style={[
              styles.paymentStatus,
              isPaid ? styles.paymentStatusPaid : null,
              isOverdue ? styles.paymentStatusOverdue : null,
              isPendingConfirmation ? styles.paymentStatusPending : null,
            ]}
          >
            {paymentLabel}
          </Text>
        ) : null}
      </View>

      {role === "buyer" && isActiveContract && canBuyerMarkPayment(contract, payment) ? (
        <Pressable
          style={[styles.btn, styles.btnPrimary, pendingKey != null ? styles.disabled : null]}
          disabled={pendingKey != null}
          onPress={() => onMarkPaid(payment.paymentIndex)}
        >
          <Text style={[styles.btnText, styles.btnTextPrimary]}>
            {pendingKey === `mark:${payment.paymentIndex}`
              ? INSTALLMENT_UI.ACTION_PENDING
              : INSTALLMENT_UI.MARK_PAID}
          </Text>
        </Pressable>
      ) : null}

      {role === "seller" &&
      !earlyPayoffPending &&
      payment.status === paymentStatuses.pendingConfirmation ? (
        <View style={styles.paymentActions}>
          <Pressable
            style={[styles.btn, styles.btnPrimary, pendingKey != null ? styles.disabled : null]}
            disabled={pendingKey != null}
            onPress={() => onConfirmPayment(payment.paymentIndex)}
          >
            <Text style={[styles.btnText, styles.btnTextPrimary]}>
              {pendingKey === `confirm:${payment.paymentIndex}`
                ? INSTALLMENT_UI.ACTION_PENDING
                : INSTALLMENT_UI.CONFIRM_PAYMENT}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnDanger, pendingKey != null ? styles.disabled : null]}
            disabled={pendingKey != null}
            onPress={() => onRejectPayment(payment.paymentIndex)}
          >
            <Text style={styles.btnTextDanger}>
              {pendingKey === `reject:${payment.paymentIndex}`
                ? INSTALLMENT_UI.ACTION_PENDING
                : INSTALLMENT_UI.REJECT_PAYMENT}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};
