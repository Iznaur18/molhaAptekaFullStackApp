import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { CartLine } from "@/entities/cart/lib/selectCartLines";
import { CartLineItem } from "@/entities/cart/ui/CartLineItem";
import { CartSelectAllRow } from "@/entities/cart/ui/CartSelectAllRow";
import { CART_PAGE_UI, CHECKOUT_FORM_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { formatLoyaltyPointsAmount } from "@molha/api-contract";
import { useCartFulfillmentSectionStyles } from "@/shared/theme/cartFulfillmentStyles";
import { AppButton } from "@/shared/ui/AppButton";

type CartCheckoutSummary = {
  selectedTotal: number;
  selectedListTotal: number;
  selectedDiscount: number;
  selectedPromoDiscount: number;
  selectedWholesaleDiscount: number;
  fullTotal: number;
  hasPartialSelection: boolean;
  checkoutBlockReason: string | null;
  selectedLines: CartLine[];
};

type CartFulfillmentSectionProps = {
  title: string;
  /** Предупреждение над товарами: например, их везут разные службы. */
  note?: string | null;
  lines: CartLine[];
  selectedCount: number;
  areAllSelected: boolean;
  onToggleAll: () => void;
  isLineSelected: (productId: string) => boolean;
  onToggleSelected: (productId: string) => void;
  /**
   * Оформление под товарами: форма и итог с «Оформить» (паритет web
   * `checkoutBeforeDock` + `.cart-fulfillment__dock`).
   */
  children?: ReactNode;
};

/** Корзина одного продавца: товары с галочками, под ними — оформление. */
export const CartFulfillmentSection = ({
  title,
  note = null,
  lines,
  selectedCount,
  areAllSelected,
  onToggleAll,
  isLineSelected,
  onToggleSelected,
  children = null,
}: CartFulfillmentSectionProps) => {
  const styles = useCartFulfillmentSectionStyles();

  if (lines.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{CART_PAGE_UI.SECTION_FULFILLMENT_HINT}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>

      <CartSelectAllRow
        selectedCount={selectedCount}
        totalCount={lines.length}
        areAllSelected={areAllSelected}
        onToggleAll={onToggleAll}
      />

      {lines.map((line) => (
        <CartLineItem
          key={line.productId}
          line={line}
          selected={isLineSelected(line.productId)}
          onToggleSelected={onToggleSelected}
        />
      ))}

      {children}
    </View>
  );
};

type CartCheckoutDockProps = {
  summary: CartCheckoutSummary;
  canCheckout: boolean;
  /**
   * Цена своей доставки продавца с итогом «К оплате»; есть — она заменяет
   * строку «К оплате» (паритет web `CheckoutSellerDeliveryCost` в доке).
   */
  deliveryCost?: ReactNode | null;
  error?: string;
  success?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  onSubmit: () => void;
  /** Товары за баллы: сумма в баллах, рублями — только доставка. */
  pointsTotal?: number | null;
};

/** Итог корзины продавца и «Оформить» — паритет web `.cart-fulfillment__dock`. */
export const CartCheckoutDock = ({
  summary,
  canCheckout,
  deliveryCost = null,
  error = "",
  success = "",
  isSubmitting = false,
  submitDisabled = false,
  onSubmit,
  pointsTotal = null,
}: CartCheckoutDockProps) => {
  const styles = useCartFulfillmentSectionStyles();
  const router = useRouter();

  const selectedItemsCount = summary.selectedLines.reduce(
    (sum, line) => sum + (Number(line.quantity) || 0),
    0,
  );

  return (
    <View style={styles.dock}>
      <View style={styles.dockTop}>
        <View style={styles.totalBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{CART_PAGE_UI.TOTAL_LABEL}</Text>
            <Text style={styles.itemsCount} numberOfLines={1}>
              {CART_PAGE_UI.ITEMS_COUNT(selectedItemsCount)}
            </Text>
          </View>
          {summary.selectedDiscount > 0 || summary.selectedPromoDiscount > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{CART_PAGE_UI.PRICE_LABEL}</Text>
              <Text style={styles.listPrice} numberOfLines={1}>
                {formatPriceRub(summary.selectedListTotal)}
              </Text>
            </View>
          ) : null}
          {summary.selectedDiscount > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.discountLabel}>{CART_PAGE_UI.DISCOUNT_LABEL}</Text>
              <Text style={styles.discountValue} numberOfLines={1}>
                {CART_PAGE_UI.DISCOUNT_AMOUNT(formatPriceRub(summary.selectedDiscount))}
              </Text>
            </View>
          ) : null}
          {summary.selectedPromoDiscount > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.discountLabel}>
                {CART_PAGE_UI.PROMO_DISCOUNT_LABEL}
              </Text>
              <Text style={styles.discountValue} numberOfLines={1}>
                {CART_PAGE_UI.DISCOUNT_AMOUNT(
                  formatPriceRub(summary.selectedPromoDiscount),
                )}
              </Text>
            </View>
          ) : null}
          {summary.selectedWholesaleDiscount > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.discountLabel}>
                {CART_PAGE_UI.WHOLESALE_DISCOUNT_LABEL}
              </Text>
              <Text style={styles.discountValue} numberOfLines={1}>
                {CART_PAGE_UI.DISCOUNT_AMOUNT(
                  formatPriceRub(summary.selectedWholesaleDiscount),
                )}
              </Text>
            </View>
          ) : null}
          {pointsTotal != null ? (
            <View style={styles.totalRow}>
              <Text style={styles.payableLabel}>
                {CART_PAGE_UI.POINTS_PAYABLE_LABEL}
              </Text>
              <Text style={styles.totalValue} numberOfLines={1}>
                {formatLoyaltyPointsAmount(pointsTotal)}
              </Text>
            </View>
          ) : null}
          {deliveryCost ??
            (pointsTotal != null ? null : (
              <View style={styles.totalRow}>
                <Text style={styles.payableLabel}>{CART_PAGE_UI.PAYABLE_LABEL}</Text>
                <Text style={styles.totalValue} numberOfLines={1}>
                  {formatPriceRub(summary.selectedTotal)}
                </Text>
              </View>
            ))}
        </View>
      </View>

      {pointsTotal != null ? (
        <Text style={styles.checkoutHint}>{CART_PAGE_UI.POINTS_PAYMENT_NOTE}</Text>
      ) : null}
      {!canCheckout && summary.checkoutBlockReason ? (
        <Text style={styles.checkoutHint}>{summary.checkoutBlockReason}</Text>
      ) : null}
      {error ? (
        <Text style={styles.checkoutHint} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {success ? <Text style={styles.checkoutSuccess}>{success}</Text> : null}

      <AppButton
        label={
          isSubmitting ? CHECKOUT_FORM_UI.SUBMIT_LOADING : CART_PAGE_UI.CHECKOUT_SELLER
        }
        variant="primary"
        style={styles.checkoutButton}
        disabled={!canCheckout || submitDisabled}
        onPress={onSubmit}
      />

      <Text style={styles.checkoutLegal}>
        {CART_PAGE_UI.CHECKOUT_LEGAL_HINT_PREFIX}
        <Text
          style={styles.checkoutLegalLink}
          onPress={() => router.push("/legal/privacy")}
        >
          {CART_PAGE_UI.CHECKOUT_LEGAL_PRIVACY_LINK}
        </Text>
        {CART_PAGE_UI.CHECKOUT_LEGAL_HINT_MIDDLE}
        <Text
          style={styles.checkoutLegalLink}
          onPress={() => router.push("/legal/offer")}
        >
          {CART_PAGE_UI.CHECKOUT_LEGAL_OFFER_LINK}
        </Text>
      </Text>
    </View>
  );
};
