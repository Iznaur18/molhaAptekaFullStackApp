import { Text, View } from "react-native";

import { ADD_TO_CART_UI } from "@/shared/config";
import { FIXED_FONT_PROPS } from "@/shared/lib/fixedTypography";
import { PRODUCT_DETAIL_OUT_OF_STOCK_BUTTON_LAYOUT as OOS_BTN } from "@/entities/product/lib/productDetailOutOfStockButtonLayout";
import { useAddToCartButtonStyles } from "@/shared/theme/uploadFieldStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type BlockedPurchaseButtonProps = {
  label?: string;
  variant?: "default" | "detailDock" | "teaser" | "installment" | "offer";
};

export const BlockedPurchaseButton = ({
  label = ADD_TO_CART_UI.BLOCKED,
  variant = "default",
}: BlockedPurchaseButtonProps) => {
  const styles = useAddToCartButtonStyles();
  const isDetailDock = variant === "detailDock";
  const isTeaser = variant === "teaser";
  const fixedFontProps = isDetailDock ? FIXED_FONT_PROPS : {};

  if (isTeaser) {
    return (
      <View style={styles.teaserBlockedButton}>
        <Text style={styles.teaserBlockedButtonText} {...fixedFontProps}>
          {label}
        </Text>
      </View>
    );
  }

  if (variant === "installment" || variant === "offer") {
    return (
      <SquircleView radius={OOS_BTN.borderRadius} style={styles.detailOutOfStockButton}>
        <Text style={styles.detailOutOfStockButtonText} {...fixedFontProps}>
          {label}
        </Text>
      </SquircleView>
    );
  }

  if (isDetailDock) {
    return (
      <SquircleView radius={20} style={styles.detailOutOfStockButton}>
        <Text style={styles.detailOutOfStockButtonText} {...fixedFontProps}>
          {label}
        </Text>
      </SquircleView>
    );
  }

  return (
    <SquircleView radius={OOS_BTN.borderRadius} style={styles.detailOutOfStockButton}>
      <Text style={styles.detailOutOfStockButtonText} {...fixedFontProps}>
        {label}
      </Text>
    </SquircleView>
  );
};
