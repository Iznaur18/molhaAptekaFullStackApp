# Аудит: ProductDetailsModal vs CreateProductModal (edit)

Дата: 2026-06. Файлы: `ProductDetailsModal` (~950 LOC), `CreateProductModal` (~720 LOC), CSS 564 + 219 строк.

## Роли (не дубли — разные job)

| Модалка | Кто | Задача |
| ------- | --- | ------ |
| **ProductDetailsModal** | покупатель, staff, admin (просмотр) | чтение, корзина, аукцион/рассрочка/отзывы, репорт |
| **CreateProductModal** | продавец (create/edit) | форма POST/PATCH, валидация, manage (delete/visibility/raffle) |

**Вывод:** объединять в одну модалку с табом «Редактировать» **не стоит** — разный UX и 80% уникального кода (табы details, API offers, reviews).

---

## Что реально дублируется

| Область | Details | Edit | Общее сейчас | Рекомендация |
| ------- | ------- | ---- | ------------ | ------------ |
| Shell (backdrop, header, close) | `ProductModalShell` | `ProductModalShell` | `shared/ui/ProductModalShell` | ✅ v2 |
| Portal | `ProductModalShell` | `ProductModalShell` | — | ✅ v2 |
| Scroll lock | `useScrollLock` | `useScrollLock` | ✅ | — |
| Медиа | `ProductMediaGalleryReadonly` | `ProductImageUrlSortableList` + `ProductPreviewVideoField` | `ProductMediaSlideContent`, `buildProductMediaSlides` | ✅ v3 read; write editor — отдельно |
| Характеристики | `ProductCharacteristicsDetails` | `ProductCharacteristicsEditor` | разные | ок, общий тип строк |
| Цена | `ProductPriceDisplay` | inputs + discount preview | `computeProductDiscountPercent` | ок |
| Категория | `formatProductField` / поля staff | `CreateProductCategoryPicker` | `PRODUCT_FIELD_LABEL_RU` | ок |
| Продавец | `ProductDetailsSellerPreview` | — | — | только details |
| Manage (delete/hide/auction) | admin footer → edit | `ProductEditManageSection` | дубль с **кнопками на ProductCard** | v2: manage только в edit **или** только на карточке |
| Поля dl/dt | `renderFieldRows` + константы ключей | form labels `CREATE_PRODUCT_MODAL_UI` | `formatProductFieldForDisplay` | v3: единая карта полей read/write |

---

## Потоки на Home

```
Карточка (клик)     → catalogProductDetails → ProductDetailsModal
Карточка (редакт.)  → productToEdit         → CreateProductModal mode=edit
Admin в details     → handleAdminOpenEdit…  → закрывает details, открывает edit ✅
```

**Баг (исправлен):** «Редактировать» с карточки не закрывало details → два overlay. Fix: `handleOpenEditMyProduct` / `handleCatalogProductClick` взаимно сбрасывают второй state.

---

## CSS

- Два независимых BEM-префикса, визуально похожие (radius, backdrop).
- `ProductCard.css` уже разбит на `product-card/*`; модалки — следующий кандидат: `product-modal/productModalTokens.css` (z-index, radius, max-width).

---

## План рефакторинга (приоритет)

### v1 (сделано в аудите)

- [x] Документ
- [x] Взаимное закрытие details ↔ edit на Home

### v2 (сделано)

- [x] `shared/ui/ProductModalShell` — backdrop, dialog, title, close, `md`/`lg`, `bodyRef`, `closeOnEscape`
- [x] `ProductDetailsModal` + `CreateProductModal` на shell; дубли shell CSS убраны из modal CSS
- [x] Details: `closeOnEscape={false}` — свой Escape (lightbox)
- [x] a11y: `useDialogFocusTrap` в shell + стек слоёв; `ProductImageLightbox` — вложенный trap
- manage на карточке vs edit — без изменений (уже по плану)

### v3

1. [x] `ProductMediaGalleryReadonly` — slider + thumbs + lightbox из `ProductDetailsModal`
2. [x] Карта полей `productFieldRegistry.js` (label, read component, edit input)

### Не делать

- Один «супер-модал» с 15 табами.
- CSS modules только ради модалок (остальной client — plain CSS).

---

## Другие модалки товара (вне scope)

| Модалка | Связь |
| ------- | ----- |
| `ProductPromotionModal` | отдельный flow |
| `ReportProductModal` | footer details |
| `InstallmentProgramModal` | вложена в edit |
| `ProductImageLightbox` | только details |
| `SellerProductsLimitModal` | лимит create |

---

## Чеклист регрессии после v2/v3

- [ ] Каталог: клик карточки → details → закрыть
- [ ] Мои товары: edit с карточки (details не остаётся под edit)
- [ ] Admin: details → edit → save → каталог обновился
- [ ] Cart/orders: details по productId
- [ ] E2E `catalog-cart.spec.js`, `seller-create-product.spec.js`
