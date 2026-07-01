import { Pressable, Text, TextInput, View } from "react-native";

import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { useInstallmentContractCard } from "@/entities/installment/model/useInstallmentContractCard";
import { InstallmentContractCardPayments } from "@/entities/installment/ui/InstallmentContractCardPayments";
import { InstallmentContractCardSummary } from "@/entities/installment/ui/InstallmentContractCardSummary";
import { InstallmentContractCounterparty } from "@/entities/installment/ui/InstallmentContractCounterparty";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useInstallmentContractCardChromeStyles } from "@/shared/theme/installmentContractCardChromeStyles";

type InstallmentContractCardProps = {
  contract: InstallmentContract;
  role: "buyer" | "seller";
  onUpdated?: () => void;
  onCounterpartyClick?: (userId: string) => void;
  onProductClick?: (productId: string) => void;
  onProductPress?: (productId: string) => void;
  compact?: boolean;
};

const resolveProductId = (contract: InstallmentContract) =>
  contract.productId ?? contract.product?._id ?? "";

const resolveProductName = (contract: InstallmentContract) =>
  contract.productNameAtContract ?? contract.product?.productName ?? "Товар";

const resolveStatusPillStyle = (
  status: string | undefined,
  styles: ReturnType<typeof useInstallmentContractCardChromeStyles>,
) => {
  if (status === "completed") {
    return { pill: styles.statusPillCompleted, text: styles.statusPillCompletedText };
  }
  if (status === "defaulted") {
    return { pill: styles.statusPillDefaulted, text: styles.statusPillDefaultedText };
  }
  if (status === "cancelled") {
    return { pill: styles.statusPillCancelled, text: styles.statusPillCancelledText };
  }
  if (status === "active" || status === "pending_first_payment") {
    return { pill: styles.statusPillActive, text: undefined };
  }
  return { pill: undefined, text: undefined };
};

export const InstallmentContractCard = ({
  contract,
  role,
  onUpdated,
  onCounterpartyClick,
  onProductClick,
  onProductPress,
  compact = false,
}: InstallmentContractCardProps) => {
  const styles = useInstallmentContractCardChromeStyles();
  const card = useInstallmentContractCard({ contract, role, onUpdated });
  const productId = resolveProductId(contract);
  const productName = resolveProductName(contract);
  const handleProductClick = onProductClick ?? onProductPress;
  const statusPillStyle = resolveStatusPillStyle(contract.status, styles);

  if (!compact) {
    return (
      <View style={styles.card}>
        {productId && handleProductClick ? (
          <Pressable onPress={() => handleProductClick(productId)}>
            <Text style={styles.productLink}>{productName}</Text>
          </Pressable>
        ) : (
          <Text style={styles.product}>{productName}</Text>
        )}

        <Text style={styles.meta}>
          {role === "buyer" ? INSTALLMENT_UI.SELLER_LABEL : INSTALLMENT_UI.BUYER_LABEL}:{" "}
          {role === "buyer"
            ? (contract.seller?.userName ?? "—")
            : (contract.buyer?.userName ?? "—")}
        </Text>
        <Text style={styles.meta}>
          {INSTALLMENT_UI.CONTRACT_STATUS}: {card.statusLabel}
        </Text>
        <Text style={styles.meta}>
          {INSTALLMENT_UI.CONTRACT_PAID}: {formatPriceRub(contract.paidAmountRub)} /{" "}
          {formatPriceRub(contract.totalAmountRub)}
        </Text>

        <InstallmentContractCardPayments
          contract={contract}
          role={role}
          compact={false}
          paymentStatusLabels={card.paymentStatusLabels}
          paymentStatuses={card.paymentStatuses}
          isActiveContract={card.isActiveContract}
          earlyPayoffPending={card.earlyPayoffPending}
          pendingKey={card.pendingKey}
          canBuyerMarkPayment={card.canBuyerMarkPayment}
          onMarkPaid={card.handleMarkPaid}
          onConfirmPayment={card.handleConfirmPayment}
          onRejectPayment={card.handleRejectPayment}
        />

        {card.error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {card.error}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.card, card.isFullyPaid ? styles.cardCompleted : null]}>
      <View style={styles.header}>
        {handleProductClick && productId ? (
          <Pressable style={styles.titlePressable} onPress={() => handleProductClick(productId)}>
            <Text style={styles.title}>{productName}</Text>
          </Pressable>
        ) : (
          <Text style={styles.titleStatic}>{productName}</Text>
        )}
        <View style={styles.headerBadges}>
          <View style={[styles.statusPill, statusPillStyle.pill]}>
            <Text style={[styles.statusPillText, statusPillStyle.text]}>{card.statusLabel}</Text>
          </View>
          {contract.hasOverduePayment ? (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueBadgeText}>{INSTALLMENT_UI.OVERDUE_BADGE}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={styles.progress}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: card.paidPercent }}
      >
        <View style={[styles.progressFill, { width: `${card.paidPercent}%` }]} />
      </View>

      {role === "buyer" ? (
        <InstallmentContractCounterparty
          label={INSTALLMENT_UI.SELLER_LABEL}
          counterparty={contract.seller}
          onUserClick={onCounterpartyClick}
        />
      ) : (
        <InstallmentContractCounterparty
          label={INSTALLMENT_UI.BUYER_LABEL}
          counterparty={contract.buyer}
          onUserClick={onCounterpartyClick}
        />
      )}

      <InstallmentContractCardSummary
        contract={contract}
        remainingRub={card.remainingRub}
        remainingDays={card.remainingDays}
        paidPercent={card.paidPercent}
      />

      <InstallmentContractCardPayments
        contract={contract}
        role={role}
        compact
        paymentStatusLabels={card.paymentStatusLabels}
        paymentStatuses={card.paymentStatuses}
        isActiveContract={card.isActiveContract}
        earlyPayoffPending={card.earlyPayoffPending}
        pendingKey={card.pendingKey}
        canBuyerMarkPayment={card.canBuyerMarkPayment}
        onMarkPaid={card.handleMarkPaid}
        onConfirmPayment={card.handleConfirmPayment}
        onRejectPayment={card.handleRejectPayment}
      />

      {card.error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {card.error}
        </Text>
      ) : null}

      {card.isActiveContract ? (
        <View style={styles.cardActions}>
          {role === "buyer" && card.earlyPayoffPending ? (
            <Pressable
              style={[styles.btn, card.pendingKey != null ? styles.disabled : null]}
              disabled={card.pendingKey != null}
              onPress={card.handleCancelEarlyPayoff}
            >
              <Text style={styles.btnText}>
                {card.pendingKey === "early-cancel"
                  ? INSTALLMENT_UI.ACTION_PENDING
                  : INSTALLMENT_UI.CANCEL_EARLY_PAYOFF}
              </Text>
            </Pressable>
          ) : null}
          {role === "buyer" && !card.earlyPayoffPending && card.nextPayablePayment != null ? (
            <Pressable
              style={[styles.btn, card.pendingKey != null ? styles.disabled : null]}
              disabled={card.pendingKey != null}
              onPress={card.handleEarlyPayoff}
            >
              <Text style={styles.btnText}>
                {card.pendingKey === "early"
                  ? INSTALLMENT_UI.ACTION_PENDING
                  : INSTALLMENT_UI.EARLY_PAYOFF}
              </Text>
            </Pressable>
          ) : null}
          {role === "seller" && card.earlyPayoffPending ? (
            <>
              <Pressable
                style={[styles.btn, styles.btnSuccess, card.pendingKey != null ? styles.disabled : null]}
                disabled={card.pendingKey != null}
                onPress={card.handleConfirmEarlyPayoff}
              >
                <Text style={[styles.btnText, styles.btnTextPrimary]}>
                  {card.pendingKey === "early-confirm"
                    ? INSTALLMENT_UI.ACTION_PENDING
                    : INSTALLMENT_UI.CONFIRM_EARLY_PAYOFF}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnDanger, card.pendingKey != null ? styles.disabled : null]}
                disabled={card.pendingKey != null}
                onPress={card.handleRejectEarlyPayoff}
              >
                <Text style={styles.btnTextDanger}>
                  {card.pendingKey === "early-reject"
                    ? INSTALLMENT_UI.ACTION_PENDING
                    : INSTALLMENT_UI.REJECT_EARLY_PAYOFF}
                </Text>
              </Pressable>
            </>
          ) : null}
          {role === "buyer" ? (
            !card.showDisputeForm ? (
              <Pressable
                style={[styles.btn, card.pendingKey != null ? styles.disabled : null]}
                disabled={card.pendingKey != null}
                onPress={() => card.setShowDisputeForm(true)}
              >
                <Text style={styles.btnText}>{INSTALLMENT_UI.OPEN_DISPUTE}</Text>
              </Pressable>
            ) : (
              <View style={styles.disputeForm}>
                <TextInput
                  style={styles.textarea}
                  value={card.disputeReason}
                  onChangeText={card.setDisputeReason}
                  placeholder={INSTALLMENT_UI.DISPUTE_REASON_PLACEHOLDER}
                  multiline
                />
                <Pressable
                  style={[styles.btn, styles.btnPrimary, card.pendingKey != null ? styles.disabled : null]}
                  disabled={card.pendingKey != null}
                  onPress={card.handleOpenDispute}
                >
                  <Text style={[styles.btnText, styles.btnTextPrimary]}>
                    {card.pendingKey === "dispute"
                      ? INSTALLMENT_UI.ACTION_PENDING
                      : INSTALLMENT_UI.OPEN_DISPUTE}
                  </Text>
                </Pressable>
              </View>
            )
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
