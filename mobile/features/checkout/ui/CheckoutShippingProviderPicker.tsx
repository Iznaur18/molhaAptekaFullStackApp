import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CHECKOUT_FORM_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

/** Карточка «своей доставки» продавца: службы у неё нет. */
const SELLER_CARD_ID = "seller";

export type CheckoutCarrierOption = {
  /** Id службы из контракта (`SHIPPING_PROVIDER_*`). */
  id: string;
  label: string;
};

type CheckoutShippingProviderPickerProps = {
  disabled?: boolean;
  /** Продавец везёт сам. */
  sellerDeliveryAvailable?: boolean;
  /**
   * Подпись «своей доставки», когда службу задал продавец на товаре (ЛОБО):
   * везёт она, а не продавец (паритет web — карточка службы выбрана).
   */
  sellerCardLabel?: string | null;
  /** Службы, по которым продавец подключил договор и включил доставку. */
  carriers?: readonly CheckoutCarrierOption[];
  /** Выбранная служба; `null` — своя доставка продавца. */
  selectedCarrier?: string | null;
  onSelectCarrier?: (carrier: string | null) => void;
};

/**
 * Службы доставки в оформлении.
 *
 * Внутри «Доставки» покупатель выбирает службу из тех, что разрешил продавец:
 * его собственную доставку или службу, по которой у продавца договор. Если
 * вариант один, выбирать нечего — показываем строкой «Доставку выполняет …»,
 * а не списком из одной карточки.
 */
export const CheckoutShippingProviderPicker = ({
  disabled = false,
  sellerDeliveryAvailable = true,
  sellerCardLabel = null,
  carriers = [],
  selectedCarrier = null,
  onSelectCarrier,
}: CheckoutShippingProviderPickerProps) => {
  const theme = useAppTheme();
  const cards = [
    ...(sellerDeliveryAvailable
      ? [
          {
            id: SELLER_CARD_ID,
            label: sellerCardLabel ?? CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SELLER,
          },
        ]
      : []),
    ...carriers,
  ];
  const selectedId = selectedCarrier ?? SELLER_CARD_ID;

  if (cards.length === 0) {
    return null;
  }

  if (cards.length === 1) {
    // В плашке — именительный падеж: «Доставку выполняет продавец», а не
    // подпись карточки «Продавцом».
    const singleName =
      cards[0].id === SELLER_CARD_ID
        ? (sellerCardLabel ?? CHECKOUT_FORM_UI.SHIPPING_PROVIDER_BADGE_SELLER)
        : cards[0].label;
    return (
      <View style={styles.root}>
        <View
          style={[
            styles.single,
            {
              borderColor: theme.colors.action,
              backgroundColor: theme.colors.actionSoft,
            },
          ]}
          accessibilityRole="text"
          accessibilityLabel={`${CHECKOUT_FORM_UI.SHIPPING_PROVIDER_BADGE_CAPTION} ${singleName}`}
        >
          <Text style={[styles.singleCaption, { color: theme.colors.textSecondary }]}>
            {CHECKOUT_FORM_UI.SHIPPING_PROVIDER_BADGE_CAPTION}
          </Text>
          <Text style={[styles.singleName, { color: theme.colors.text }]}>
            {singleName}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={[styles.legend, { color: theme.colors.textSecondary }]}>
        {CHECKOUT_FORM_UI.LABEL_SHIPPING_PROVIDER}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.wrap}
        accessibilityRole="radiogroup"
      >
        {cards.map((card) => {
          const isSelected = card.id === selectedId;

          return (
            <Pressable
              key={card.id}
              disabled={disabled}
              onPress={() =>
                onSelectCarrier?.(card.id === SELLER_CARD_ID ? null : card.id)
              }
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled }}
              accessibilityLabel={card.label}
              style={[
                styles.card,
                {
                  borderColor: isSelected
                    ? theme.colors.action
                    : theme.colors.actionSoft,
                  backgroundColor: isSelected
                    ? theme.colors.surface
                    : theme.colors.actionSoft,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardLabel,
                  { color: isSelected ? theme.colors.text : theme.colors.action },
                ]}
              >
                {card.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 10,
    marginTop: 4,
  },
  legend: {
    fontSize: 14,
    fontWeight: "600",
  },
  wrap: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 4,
  },
  card: {
    width: 116,
    minHeight: 72,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  single: {
    alignSelf: "flex-start",
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  singleCaption: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "500",
  },
  singleName: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
  },
});
