/** Паритет `.add-to-cart` / `.add-to-cart--login` в `AddToCartButton.css`. */
export const ADD_TO_CART_BUTTON_LAYOUT = {
  borderRadius: 16,
  borderWidth: 1,
  paddingVertical: 7.2,
  paddingHorizontal: 16,
  fontSize: 14.4,
  fontWeight: "600" as const,
} as const;

/** Паритет `.add-to-cart__stepper` / step-button / quantity в `AddToCartButton.css`. */
export const ADD_TO_CART_STEPPER_LAYOUT = {
  gap: 6.4,
  paddingVertical: 4,
  paddingHorizontal: 6.4,
  borderRadius: 16,
  borderWidth: 1,
  stepButtonSize: 28,
  stepButtonRadius: 5.6,
  stepButtonFontSize: 16,
  quantityFontSize: 15.2,
  quantityMinWidth: 22.4,
} as const;
