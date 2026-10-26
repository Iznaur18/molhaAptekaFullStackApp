import { Text, View } from "react-native";

import { CHECKOUT_FORM_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useCheckoutSellerDeliveryCostStyles } from "@/shared/theme/formChromeStyles";

/** Цена, которую назвала служба: ЛОБО — по адресу, СДЭК и Яндекс — по пункту. */
export type CarrierDeliveryCost = {
  feeRub: number;
  label: string;
  /** У ЛОБО цена примерная — точную назовёт курьер. */
  approximate: boolean;
};

type CheckoutCarrierDeliveryCostProps = {
  cost: CarrierDeliveryCost | null;
  goodsTotalRub: number;
};

/**
 * Доставка внешней службой в итоге корзины — паритет web
 * `CheckoutCarrierDeliveryCost`: сколько берёт служба и сколько выйдет вместе
 * с товарами. Встаёт на место «К оплате».
 */
export const CheckoutCarrierDeliveryCost = ({
  cost,
  goodsTotalRub,
}: CheckoutCarrierDeliveryCostProps) => {
  const styles = useCheckoutSellerDeliveryCostStyles();
  const feeRub = Number(cost?.feeRub) || 0;
  if (!cost || feeRub <= 0) {
    return null;
  }
  const goods = Number(goodsTotalRub) || 0;
  const format = (rub: number) =>
    cost.approximate
      ? CHECKOUT_FORM_UI.CARRIER_DELIVERY_APPROX(formatPriceRub(rub))
      : formatPriceRub(rub);

  return (
    <View style={[styles.root, styles.rootInDock]}>
      <View style={styles.row}>
        <Text style={styles.legend}>{cost.label}</Text>
        <Text style={styles.value}>{format(feeRub)}</Text>
      </View>
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{CHECKOUT_FORM_UI.TOTAL_GOODS}</Text>
          <Text style={styles.totalValue}>{formatPriceRub(goods)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{CHECKOUT_FORM_UI.TOTAL_DELIVERY}</Text>
          <Text style={styles.totalValue}>{format(feeRub)}</Text>
        </View>
        <View style={[styles.totalRow, styles.totalRowSum]}>
          <Text style={styles.totalSumLabel}>{CHECKOUT_FORM_UI.TOTAL_TO_PAY}</Text>
          <Text style={styles.totalSumValue}>{format(goods + feeRub)}</Text>
        </View>
      </View>
    </View>
  );
};
