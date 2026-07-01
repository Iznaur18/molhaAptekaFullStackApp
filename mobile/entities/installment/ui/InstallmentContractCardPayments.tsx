import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { partitionInstallmentContractPayments } from "@/entities/installment/lib/partitionInstallmentContractPayments";
import { InstallmentContractCardPaymentRow } from "@/entities/installment/ui/InstallmentContractCardPaymentRow";
import { INSTALLMENT_UI } from "@/shared/config";
import { useInstallmentContractCardChromeStyles } from "@/shared/theme/installmentContractCardChromeStyles";

type PaymentStatuses = {
  due: string;
  overdue: string;
  pendingConfirmation: string;
  paid: string;
};

type InstallmentContractCardPaymentsProps = {
  contract: InstallmentContract;
  role: "buyer" | "seller";
  compact?: boolean;
  paymentStatusLabels: Record<string, string>;
  paymentStatuses: PaymentStatuses;
  isActiveContract: boolean;
  earlyPayoffPending: boolean;
  pendingKey: string | null;
  canBuyerMarkPayment: (
    contract: InstallmentContract,
    payment: NonNullable<InstallmentContract["payments"]>[number],
  ) => boolean;
  onMarkPaid: (paymentIndex: number) => void;
  onConfirmPayment: (paymentIndex: number) => void;
  onRejectPayment: (paymentIndex: number) => void;
};

const PaymentsFold = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  const styles = useInstallmentContractCardChromeStyles();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.fold}>
      <Pressable style={styles.foldSummary} onPress={() => setExpanded((value) => !value)}>
        <Text style={styles.foldSummaryText}>
          {expanded ? "▾ " : "▸ "}
          {title}
        </Text>
      </Pressable>
      {expanded ? <View style={styles.foldBody}>{children}</View> : null}
    </View>
  );
};

export const InstallmentContractCardPayments = ({
  contract,
  role,
  compact = false,
  paymentStatusLabels,
  paymentStatuses,
  isActiveContract,
  earlyPayoffPending,
  pendingKey,
  canBuyerMarkPayment,
  onMarkPaid,
  onConfirmPayment,
  onRejectPayment,
}: InstallmentContractCardPaymentsProps) => {
  const styles = useInstallmentContractCardChromeStyles();
  const payments = contract.payments ?? [];
  const { focus, upcoming, history } = partitionInstallmentContractPayments(
    payments,
    paymentStatuses,
  );

  const renderRow = (payment: NonNullable<InstallmentContract["payments"]>[number]) => (
    <InstallmentContractCardPaymentRow
      key={`${payment.paymentIndex}-${payment._id ?? "p"}`}
      payment={payment}
      paymentLabel={paymentStatusLabels[payment.status ?? ""] ?? payment.status ?? "—"}
      paymentStatuses={paymentStatuses}
      role={role}
      isActiveContract={isActiveContract}
      earlyPayoffPending={earlyPayoffPending}
      pendingKey={pendingKey}
      contract={contract}
      canBuyerMarkPayment={canBuyerMarkPayment}
      onMarkPaid={onMarkPaid}
      onConfirmPayment={onConfirmPayment}
      onRejectPayment={onRejectPayment}
      compact={compact}
    />
  );

  if (!compact) {
    return (
      <View style={styles.payments}>
        <Text style={styles.paymentsTitle}>{INSTALLMENT_UI.PAYMENTS_HEADING}</Text>
        {payments.map(renderRow)}
      </View>
    );
  }

  return (
    <View style={styles.payments}>
      {focus.length > 0 ? (
        <View style={styles.fold}>
          <Text style={styles.paymentsTitle}>{INSTALLMENT_UI.PAYMENTS_FOCUS_HEADING}</Text>
          {focus.map(renderRow)}
        </View>
      ) : null}

      {upcoming.length > 0 ? (
        <PaymentsFold title={INSTALLMENT_UI.PAYMENTS_UPCOMING_SUMMARY(upcoming.length)}>
          {upcoming.map(renderRow)}
        </PaymentsFold>
      ) : null}

      {history.length > 0 ? (
        <PaymentsFold title={INSTALLMENT_UI.PAYMENTS_HISTORY_SUMMARY(history.length)}>
          {history.map(renderRow)}
        </PaymentsFold>
      ) : null}

      {focus.length === 0 && upcoming.length === 0 && history.length === 0 ? (
        <Text style={styles.meta}>{INSTALLMENT_UI.PAYMENTS_HEADING}</Text>
      ) : null}
    </View>
  );
};
