import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { INSTALLMENT_CONTRACT_CARD_LAYOUT as L } from "@/entities/installment/lib/installmentContractCardLayout";
import { contractNeedsBuyerAttention } from "@/entities/installment/lib/contractNeedsBuyerAttention";
import { contractNeedsSellerAttention } from "@/entities/installment/lib/contractNeedsSellerAttention";
import { useInstallmentContractCard } from "@/entities/installment/model/useInstallmentContractCard";
import { InstallmentContractCardPayments } from "@/entities/installment/ui/InstallmentContractCardPayments";
import { InstallmentContractProgressBar } from "@/entities/installment/ui/InstallmentContractProgressBar";
import { InstallmentContractCardSummary } from "@/entities/installment/ui/InstallmentContractCardSummary";
import { InstallmentContractCounterparty } from "@/entities/installment/ui/InstallmentContractCounterparty";
import { BuyerPassportSharePanel } from "@/entities/installment/ui/BuyerPassportSharePanel";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "@/entities/product/model/constants";
import { COMMERCE_CARD_UI, INSTALLMENT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useInstallmentContractCardChromeStyles } from "@/shared/theme/installmentContractCardChromeStyles";
import { CommerceCardFoldPanel } from "@/shared/ui/CommerceCardFoldPanel";

type InstallmentContractCardProps = {
  contract: InstallmentContract;
  role: "buyer" | "seller";
  onUpdated?: () => void;
  onCounterpartyClick?: (userId: string) => void;
  onProductClick?: (productId: string) => void;
  onProductPress?: (productId: string) => void;
  compact?: boolean;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

const resolveProductId = (contract: InstallmentContract) =>
  contract.productId ?? contract.product?._id ?? "";

const resolveProductName = (contract: InstallmentContract) =>
  contract.productNameAtContract ?? contract.product?.productName ?? "Товар";

const resolveProductThumbUrl = (contract: InstallmentContract) => {
  const raw = String(
    contract.productImageUrl ?? contract.product?.productImageUrl ?? "",
  ).trim();
  return resolveUploadedMediaUrl(raw) || PRODUCT_IMAGE_PLACEHOLDER_URL;
};

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
  collapsible = false,
  expanded = true,
  onExpandedChange,
}: InstallmentContractCardProps) => {
  const styles = useInstallmentContractCardChromeStyles();
  const { isPhoneLayout } = useProfileAdaptiveLayout();
  const card = useInstallmentContractCard({ contract, role, onUpdated });
  const productId = resolveProductId(contract);
  const productName = resolveProductName(contract);
  const thumbUrl = resolveProductThumbUrl(contract);
  const [thumbFailed, setThumbFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const handleProductClick = onProductClick ?? onProductPress;
  const statusPillStyle = resolveStatusPillStyle(contract.status, styles);
  const isExpanded = !collapsible || expanded;
  const chevronProgress = useSharedValue(isExpanded ? 1 : 0);
  /** web Mobile.css: `--compact` chrome only at ≤640 */
  const phoneCompactChrome = Boolean(compact && isPhoneLayout);
  const needsAttention =
    role === "buyer"
      ? contractNeedsBuyerAttention(contract)
      : contractNeedsSellerAttention(contract);

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
    chevronProgress.value = withTiming(isExpanded ? 1 : 0, {
      duration: reduceMotion ? 100 : L.chevronDurationMs,
      easing: Easing.inOut(Easing.ease),
    });
  }, [chevronProgress, isExpanded, reduceMotion]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronProgress.value * 90}deg` }],
  }));

  const toggleExpanded = () => {
    onExpandedChange?.(!expanded);
  };

  const pendingConfirmationPayment = (contract.payments ?? []).find(
    (payment) => payment.status === "pending_confirmation",
  );

  const nextDuePreview =
    role === "buyer" && card.nextPayablePayment
      ? INSTALLMENT_UI.PAYMENTS_NEXT_DUE(
          formatPriceRub(card.nextPayablePayment.amountRub),
          card.nextPayablePayment.dueAt
            ? new Date(card.nextPayablePayment.dueAt).toLocaleDateString("ru-RU")
            : "—",
        )
      : role === "seller" && card.earlyPayoffPending
        ? INSTALLMENT_UI.SALES_NEXT_ACTION_EARLY_PAYOFF
        : role === "seller" && pendingConfirmationPayment
          ? INSTALLMENT_UI.PAYMENTS_NEXT_DUE(
              formatPriceRub(pendingConfirmationPayment.amountRub),
              pendingConfirmationPayment.dueAt
                ? new Date(pendingConfirmationPayment.dueAt).toLocaleDateString("ru-RU")
                : "—",
            )
          : null;

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
        {role === "seller" && contract.buyerPassportShare ? (
          <BuyerPassportSharePanel share={contract.buyerPassportShare} />
        ) : null}
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
    <View
      style={[
        styles.card,
        card.isFullyPaid ? styles.cardCompleted : null,
        needsAttention ? styles.cardAttention : null,
      ]}
    >
      <View style={[styles.header, phoneCompactChrome ? styles.headerPhone : null]}>
        {collapsible ? (
          <Pressable
            style={[
              styles.headerToggle,
              phoneCompactChrome ? styles.headerTogglePhone : null,
            ]}
            accessibilityRole="button"
            accessibilityState={{ expanded: isExpanded }}
            accessibilityLabel={COMMERCE_CARD_UI.EXPAND_TOGGLE_ARIA(isExpanded)}
            onPress={toggleExpanded}
          >
            <View style={styles.productRow}>
              <Image
                source={{
                  uri: thumbFailed ? PRODUCT_IMAGE_PLACEHOLDER_URL : thumbUrl,
                }}
                style={styles.thumb}
                contentFit="cover"
                accessibilityIgnoresInvertColors
                onError={() => setThumbFailed(true)}
              />
              {handleProductClick && productId ? (
                <Pressable
                  style={styles.titlePressable}
                  onPress={(event) => {
                    event.stopPropagation?.();
                    handleProductClick(productId);
                  }}
                >
                  <Text style={styles.title} numberOfLines={2}>
                    {productName}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.titleStatic} numberOfLines={2}>
                  {productName}
                </Text>
              )}
            </View>
            <Animated.Text
              style={[styles.chevron, chevronStyle]}
              accessibilityElementsHidden
            >
              ▸
            </Animated.Text>
          </Pressable>
        ) : (
          <View style={styles.productRow}>
            <Image
              source={{
                uri: thumbFailed ? PRODUCT_IMAGE_PLACEHOLDER_URL : thumbUrl,
              }}
              style={styles.thumb}
              contentFit="cover"
              accessibilityIgnoresInvertColors
              onError={() => setThumbFailed(true)}
            />
            {handleProductClick && productId ? (
              <Pressable
                style={styles.titlePressable}
                onPress={() => handleProductClick(productId)}
              >
                <Text style={styles.title} numberOfLines={2}>
                  {productName}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.titleStatic} numberOfLines={2}>
                {productName}
              </Text>
            )}
          </View>
        )}
        <View style={styles.headerBadges}>
          <View style={[styles.statusPill, statusPillStyle.pill]}>
            <Text style={[styles.statusPillText, statusPillStyle.text]}>
              {card.statusLabel}
            </Text>
          </View>
          {contract.hasOverduePayment ? (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueBadgeText}>
                {INSTALLMENT_UI.OVERDUE_BADGE}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <InstallmentContractProgressBar
        percent={card.paidPercent}
        ariaLabel={`${INSTALLMENT_UI.CONTRACT_PAID}: ${card.paidPercent}%`}
      />

      {collapsible ? (
        <View style={styles.collapsibleRegion}>
          {nextDuePreview ? (
            <CommerceCardFoldPanel open={!isExpanded}>
              <Text style={styles.nextDue}>{nextDuePreview}</Text>
            </CommerceCardFoldPanel>
          ) : null}

          <CommerceCardFoldPanel open={isExpanded} innerStyle={styles.foldBody}>
            {role === "buyer" ? (
              <InstallmentContractCounterparty
                label={INSTALLMENT_UI.SELLER_LABEL}
                counterparty={contract.seller}
                onUserClick={onCounterpartyClick}
                compact={phoneCompactChrome}
              />
            ) : (
              <InstallmentContractCounterparty
                label={INSTALLMENT_UI.BUYER_LABEL}
                counterparty={contract.buyer}
                onUserClick={onCounterpartyClick}
                compact={phoneCompactChrome}
              />
            )}

            {role === "seller" && contract.buyerPassportShare ? (
              <BuyerPassportSharePanel share={contract.buyerPassportShare} />
            ) : null}

            <InstallmentContractCardSummary
              contract={contract}
              remainingRub={card.remainingRub}
              remainingDays={card.remainingDays}
              paidPercent={card.paidPercent}
            />

            <InstallmentContractCardPayments
              contract={contract}
              role={role}
              compact={phoneCompactChrome}
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
              <View
                style={[
                  styles.cardActions,
                  phoneCompactChrome ? styles.cardActionsPhone : null,
                ]}
              >
                {role === "buyer" && card.earlyPayoffPending ? (
                  <Pressable
                    style={[
                      styles.btn,
                      styles.btnCancel,
                      phoneCompactChrome ? styles.btnFullWidth : null,
                      card.pendingKey != null ? styles.disabled : null,
                    ]}
                    disabled={card.pendingKey != null}
                    onPress={card.handleCancelEarlyPayoff}
                  >
                    <Text style={[styles.btnText, styles.btnTextPrimary]}>
                      {card.pendingKey === "early-cancel"
                        ? INSTALLMENT_UI.ACTION_PENDING
                        : INSTALLMENT_UI.CANCEL_EARLY_PAYOFF}
                    </Text>
                  </Pressable>
                ) : null}
                {role === "buyer" &&
                !card.earlyPayoffPending &&
                card.nextPayablePayment != null ? (
                  <Pressable
                    style={[
                      styles.btn,
                      phoneCompactChrome ? styles.btnFullWidth : null,
                      card.pendingKey != null ? styles.disabled : null,
                    ]}
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
                      style={[
                        styles.btn,
                        styles.btnSuccess,
                        phoneCompactChrome ? styles.btnFullWidth : null,
                        card.pendingKey != null ? styles.disabled : null,
                      ]}
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
                      style={[
                        styles.btn,
                        styles.btnDanger,
                        phoneCompactChrome ? styles.btnFullWidth : null,
                        card.pendingKey != null ? styles.disabled : null,
                      ]}
                      disabled={card.pendingKey != null}
                      onPress={card.handleRejectEarlyPayoff}
                    >
                      <Text style={[styles.btnText, styles.btnTextDanger]}>
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
                      style={[
                        styles.btn,
                        phoneCompactChrome ? styles.btnFullWidth : null,
                        card.pendingKey != null ? styles.disabled : null,
                      ]}
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
                        style={[
                          styles.btn,
                          styles.btnPrimary,
                          phoneCompactChrome ? styles.btnFullWidth : null,
                          card.pendingKey != null ? styles.disabled : null,
                        ]}
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
          </CommerceCardFoldPanel>
        </View>
      ) : (
        <View style={styles.foldBody}>
          {role === "buyer" ? (
            <InstallmentContractCounterparty
              label={INSTALLMENT_UI.SELLER_LABEL}
              counterparty={contract.seller}
              onUserClick={onCounterpartyClick}
              compact={phoneCompactChrome}
            />
          ) : (
            <InstallmentContractCounterparty
              label={INSTALLMENT_UI.BUYER_LABEL}
              counterparty={contract.buyer}
              onUserClick={onCounterpartyClick}
              compact={phoneCompactChrome}
            />
          )}

          {role === "seller" && contract.buyerPassportShare ? (
            <BuyerPassportSharePanel share={contract.buyerPassportShare} />
          ) : null}

          <InstallmentContractCardSummary
            contract={contract}
            remainingRub={card.remainingRub}
            remainingDays={card.remainingDays}
            paidPercent={card.paidPercent}
          />

          <InstallmentContractCardPayments
            contract={contract}
            role={role}
            compact={phoneCompactChrome}
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
            <View
              style={[
                styles.cardActions,
                phoneCompactChrome ? styles.cardActionsPhone : null,
              ]}
            >
              {role === "buyer" && card.earlyPayoffPending ? (
                <Pressable
                  style={[
                    styles.btn,
                    styles.btnCancel,
                    phoneCompactChrome ? styles.btnFullWidth : null,
                    card.pendingKey != null ? styles.disabled : null,
                  ]}
                  disabled={card.pendingKey != null}
                  onPress={card.handleCancelEarlyPayoff}
                >
                  <Text style={[styles.btnText, styles.btnTextPrimary]}>
                    {card.pendingKey === "early-cancel"
                      ? INSTALLMENT_UI.ACTION_PENDING
                      : INSTALLMENT_UI.CANCEL_EARLY_PAYOFF}
                  </Text>
                </Pressable>
              ) : null}
              {role === "buyer" &&
              !card.earlyPayoffPending &&
              card.nextPayablePayment != null ? (
                <Pressable
                  style={[
                    styles.btn,
                    phoneCompactChrome ? styles.btnFullWidth : null,
                    card.pendingKey != null ? styles.disabled : null,
                  ]}
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
                    style={[
                      styles.btn,
                      styles.btnSuccess,
                      phoneCompactChrome ? styles.btnFullWidth : null,
                      card.pendingKey != null ? styles.disabled : null,
                    ]}
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
                    style={[
                      styles.btn,
                      styles.btnDanger,
                      phoneCompactChrome ? styles.btnFullWidth : null,
                      card.pendingKey != null ? styles.disabled : null,
                    ]}
                    disabled={card.pendingKey != null}
                    onPress={card.handleRejectEarlyPayoff}
                  >
                    <Text style={[styles.btnText, styles.btnTextDanger]}>
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
                    style={[
                      styles.btn,
                      phoneCompactChrome ? styles.btnFullWidth : null,
                      card.pendingKey != null ? styles.disabled : null,
                    ]}
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
                      style={[
                        styles.btn,
                        styles.btnPrimary,
                        phoneCompactChrome ? styles.btnFullWidth : null,
                        card.pendingKey != null ? styles.disabled : null,
                      ]}
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
      )}
    </View>
  );
};
