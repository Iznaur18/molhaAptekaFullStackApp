/**
 * «Мои товары»: не показываем 1С-карточки, снятые hold-правилом или
 * недоступные (пустышки без картинок/остатка). Ручные товары продавца
 * по-прежнему видны при любом productIsAvailable.
 */
export const myProductsExcludeHiddenOneCFilter = {
  $nor: [
    { productFromOneC: true, product1cHeld: true },
    // Скрытое паузой магазина продавец должен видеть: это его живые товары.
    {
      productFromOneC: true,
      productIsAvailable: false,
      productPausedWithStore: { $ne: true },
    },
  ],
};
