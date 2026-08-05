import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";

import {
  PRODUCT_LISTING_ORIGIN_OPTIONS,
  type ProductListingOrigin,
} from "@/entities/product/lib/productListingOrigin";
import { CREATE_PRODUCT_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ProductListingOriginChipsProps = {
  value: ProductListingOrigin | null;
  onChange: (next: ProductListingOrigin) => void;
  disabled?: boolean;
  /** When false, omit the field label (wizard step already shows the title). */
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const ProductListingOriginChips = ({
  value,
  onChange,
  disabled = false,
  showLabel = true,
  style,
}: ProductListingOriginChipsProps) => {
  const theme = useAppTheme();

  return (
    <View style={style} accessibilityLabel={CREATE_PRODUCT_UI.LABEL_LISTING_ORIGIN}>
      {showLabel ? (
        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600", marginBottom: 8 }}>
          {CREATE_PRODUCT_UI.LABEL_LISTING_ORIGIN}{" "}
          <Text style={{ color: theme.colors.danger }}>*</Text>
        </Text>
      ) : null}
      <View style={{ gap: 10 }}>
        {PRODUCT_LISTING_ORIGIN_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: selected ? theme.colors.action : theme.colors.border,
                backgroundColor: selected ? theme.colors.action : theme.colors.surfaceMuted,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: selected ? theme.colors.onContrast : theme.colors.text,
                  textAlign: "center",
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
