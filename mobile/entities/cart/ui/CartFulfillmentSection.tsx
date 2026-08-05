import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { CartLine } from "@/entities/cart/lib/selectCartLines";
import { CartLineItem } from "@/entities/cart/ui/CartLineItem";
import { CartSelectAllRow } from "@/entities/cart/ui/CartSelectAllRow";
import { CART_PAGE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useCartFulfillmentSectionStyles } from "@/shared/theme/cartFulfillmentStyles";
import { AppButton } from "@/shared/ui/AppButton";

type CartCheckoutSummary = {
  selectedTotal: number;
  selectedListTotal: number;
  selectedDiscount: number;
  selectedWholesaleDiscount: number;
  fullTotal: number;
  hasPartialSelection: boolean;
  checkoutBlockReason: string | null;
  selectedLines: CartLine[];
};

type CartFulfillmentSectionProps = {
  title: string;
  lines: CartLine[];
  selectedCount: number;
  areAllSelected: boolean;
  onToggleAll: () => void;
  isLineSelected: (productId: string) => boolean;
  onToggleSelected: (productId: string) => void;
  summary: CartCheckoutSummary;
  canCheckout: boolean;
  onCheckout: () => void;
  checkoutDisabled?: boolean;
  showDeliveryFeeNote?: boolean;
};

export const CartFulfillmentSection = ({
  title,
  lines,
  selectedCount,
  areAllSelected,
  onToggleAll,
  isLineSelected,
  onToggleSelected,
  summary,
  canCheckout,
  onCheckout,
  checkoutDisabled = false,
  showDeliveryFeeNote = false,
}: CartFulfillmentSectionProps) => {
  const styles = useCartFulfillmentSectionStyles();
  const router = useRouter();

  if (lines.length === 0) {
    return null;
  }

  const selectedItemsCount = summary.selectedLines.reduce(
    (sum, line) => sum + (Number(line.quantity) || 0),
    0,
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{CART_PAGE_UI.SECTION_FULFILLMENT_HINT}</Text>
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

      <View style={styles.dock}>
        <View style={styles.dockTop}>
          <View style={styles.totalBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{CART_PAGE_UI.TOTAL_LABEL}</Text>
              <Text style={styles.itemsCount} numberOfLines={1}>
                {CART_PAGE_UI.ITEMS_COUNT(selectedItemsCount)}
              </Text>
            </View>
            {summary.selectedDiscount > 0 ? (
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
                  {CART_PAGE_UI.DISCOUNT_AMOUNT(
                    formatPriceRub(summary.selectedDiscount),
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
            {showDeliveryFeeNote ? (
              <View style={styles.totalRow}>
                <Text style={styles.discountLabel}>
                  {CART_PAGE_UI.DELIVERY_FEE_LABEL}
                </Text>
                <Text style={styles.deliveryFeeValue}>
                  {CART_PAGE_UI.DELIVERY_FEE_VALUE}
                </Text>
              </View>
            ) : null}
            <View style={styles.totalRow}>
              <Text style={styles.payableLabel}>{CART_PAGE_UI.PAYABLE_LABEL}</Text>
              <Text style={styles.totalValue} numberOfLines={1}>
                {formatPriceRub(summary.selectedTotal)}
              </Text>
            </View>
          </View>
        </View>

        {!canCheckout && summary.checkoutBlockReason ? (
          <Text style={styles.checkoutHint}>{summary.checkoutBlockReason}</Text>
        ) : null}

        <AppButton
          label={CART_PAGE_UI.CHECKOUT_OPEN}
          variant="primary"
          style={styles.checkoutButton}
          disabled={!canCheckout || checkoutDisabled}
          onPress={onCheckout}
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
    </View>
  );
};
