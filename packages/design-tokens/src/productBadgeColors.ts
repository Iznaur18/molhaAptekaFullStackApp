/**
 * Повторяющиеся hex бейджей/CTA вне семантической темы.
 * Web: ProductCardBadges.css, ProductDetailsBuyNFreeOffer.css, fortune-wheel.
 * Mobile: productCardBadgePalette, productDetailsBadgeSoftPalette, games.
 */
export const izProductBadgeColors = {
  raffle: {
    border: "#f9a8d466",
    bg: "#fdf2f8",
    text: "#be185d",
  },
  /** Light-only flash sale; dark берёт warning-токены темы. */
  flashSaleLight: {
    border: "#fdba7466",
    bg: "#fff3e8",
    text: "#c2410c",
  },
  affiliate: {
    bg: "#ecfdf5",
    text: "#047857",
  },
  /** Buy-N-Free «готово» / WhatsApp-зелёный CTA на details. */
  buyNFreeReady: "#1f7a4d",
  /** Fortune wheel / lucky box accent. */
  gameAccent: "#ff7a1a",
  /** Soft tones на product details (без «Статус цены»). */
  detailsSoft: {
    discount: { backgroundColor: "#ffe4e6", color: "#be123c" },
    loyalty: { backgroundColor: "#fef3c7", color: "#b45309" },
    raffle: { backgroundColor: "#fce7f3", color: "#9d174d" },
    auction: { backgroundColor: "#dbeafe", color: "#1d4ed8" },
    installment: { backgroundColor: "#ccfbf1", color: "#0f766e" },
    promotionBoost: { backgroundColor: "#ffedd5", color: "#c2410c" },
    promotionTop: { backgroundColor: "#f2eff7", color: "#6d28d9" },
    promotionBanner: { backgroundColor: "#fee2e2", color: "#b91c1c" },
    listingOrigin: { backgroundColor: "#e0f2fe", color: "#0369a1" },
    affiliate: { backgroundColor: "#ecfdf5", color: "#047857" },
    wholesale: { backgroundColor: "#e0e7ff", color: "#3730a3" },
    rental: { backgroundColor: "#fef9c3", color: "#854d0e" },
    nearDistance: { backgroundColor: "#f1f5f9", color: "#334155" },
    safeDeal: { backgroundColor: "#dcfce7", color: "#15803d" },
  },
} as const;
