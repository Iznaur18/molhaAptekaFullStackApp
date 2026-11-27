import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { INSTALLMENT_CONTRACT_CARD_LAYOUT as L } from "@/entities/installment/lib/installmentContractCardLayout";
import { partitionInstallmentContractPayments } from "@/entities/installment/lib/partitionInstallmentContractPayments";
import { InstallmentContractCardPaymentRow } from "@/entities/installment/ui/InstallmentContractCardPaymentRow";
import { INSTALLMENT_UI, COMMERCE_CARD_UI } from "@/shared/config";
import { useInstallmentContractCardChromeStyles } from "@/shared/theme/installmentContractCardChromeStyles";
import { CommerceCardFoldPanel } from "@/shared/ui/CommerceCardFoldPanel";

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

const PaymentsFold = ({ title, children }: { title: string; children: ReactNode }) => {
  const styles = useInstallmentContractCardChromeStyles();
  const [expanded, setExpanded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (alive) setReduceMotion(Boolean(enabled));
    });
    const sub = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      (enabled: boolean) => setReduceMotion(Boolean(enabled)),
    );
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: reduceMotion ? 100 : L.chevronDurationMs,
      easing: Easing.inOut(Easing.ease),
    });
  }, [expanded, progress, reduceMotion]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 90}deg` }],
  }));

  return (
    <View style={styles.fold}>
      <Pressable
        style={styles.foldSummary}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${COMMERCE_CARD_UI.EXPAND_TOGGLE_ARIA(expanded)}. ${title}`}
        onPress={() => setExpanded((value) => !value)}
      >
        <Animated.Text style={[styles.foldSummaryChevron, chevronStyle]}>
          ▸
        </Animated.Text>
        <Text style={styles.foldSummaryText}>{title}</Text>
      </Pressable>
      <CommerceCardFoldPanel open={expanded} innerStyle={styles.paymentsFoldBody}>
        {children}
      </CommerceCardFoldPanel>
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
        <View>
          <Text style={styles.paymentsTitle}>
            {INSTALLMENT_UI.PAYMENTS_FOCUS_HEADING}
          </Text>
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
        <Text style={styles.paymentsTitle}>{INSTALLMENT_UI.PAYMENTS_HEADING}</Text>
      ) : null}
    </View>
  );
};
