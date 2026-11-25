# SYNC_PLAN — Web → Mobile UI/UX parity

**Эталон (web):** `client/`  
**Цель (mobile):** `mobile/`  
**Общие токены:** `packages/design-tokens/`  
**Дата аудита:** 2026-11-21

**Правила плана**

- Эталон — web (`client/src`). Правки по умолчанию — в `mobile/`, кроме случаев «web hardcode ломает токены» (тогда правим web + токены).
- Задачи атомарны: одна галочка = один изолированный дифф (файл(ы) + число/блок).
- Staff/admin: новые экраны **не** портировать в RN (`mobile-staff-freeze.mdc`). Web-only пути — отдельный блок «вне scope».
- rem→px при `1rem = 16`: `0.85rem → 13.6` считается ALIGNED, в чеклист не входит.
- После каждого этапа: визуальный smoke на phone + dark/custom тема.

---

## Карта эталон ↔ цель

| Слой         | Web                                                                    | Mobile                                                              |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Токены       | `packages/design-tokens` + `client/src/shared/styles/designTokens.css` | `@izibuy/design-tokens` → `AppThemeProvider` → `createThemedStyles` |
| Display font | `client/src/shared/styles/displayFont.css` (`Intro`)                   | `mobile/shared/theme/displayTypography.ts`                          |
| Shell        | `client/src/app/ui/AppShell*` + `widgets/mobile-bottom-nav`            | `mobile/app/(tabs)/_layout.tsx` + `MobileBottomTabBar`              |
| Атомы        | `client/src/shared/ui/*`                                               | `mobile/shared/ui/*` + `mobile/shared/theme/*`                      |
| Buyer path   | `/` → `/product/:id` → `/basket` → account views                       | `/(tabs)/index` → `/product/[id]` → `/(tabs)/cart` → `/hub/*`       |

---

## Вне scope (намеренно web-only)

Не синхронизировать UI в RN без отдельного product-решения:

| Path / section                                                                     | Источник                             |
| ---------------------------------------------------------------------------------- | ------------------------------------ |
| `/profile/onec-integration`, `/profile/delivery-payment`                           | `WEB_ONLY_PATHS`                     |
| `/become-courier`, `/courier-overview`, `/courier-moderation`                      | `WEB_ONLY_PATHS` + staff web-only    |
| `/admin-analytics`, `/staff-audit-log-admin`, `/broadcast-notifications-admin`     | `WEB_ONLY_PATHS`                     |
| `/safe-deal-moderation`, `/shipment-disputes`, `/shipping-carriers`                | `WEB_ONLY_PATHS`                     |
| Staff menu: `raffles`, `seller-personal-category-moderation`, `courier-moderation` | `PROFILE_STAFF_WEB_ONLY_SECTION_IDS` |
| Desktop-only: sidebar profile ≥desktop, hover-states, gallery split pinned         | platform                             |

---

# Этап 0 — Глобальные токены / тема / шрифты

Фундамент. Без него правки экранов разъедутся снова.

### 0.1 Источник правды и CI

- [x] Проверить, что `packages/design-tokens/src/colors.ts` ↔ `client/src/shared/styles/designTokens.css` совпадают по каноническим ключам (light/dark/custom); при drift — править оба + прогнать parity-скрипт пакета.
- [x] Сверить `izRadius` (`sm/md/lg/pill/button/input/modal` = 8/12/17/999/10/8/12) с CSS `--iz-radius-*`; `--iz-radius-lg` зафиксирован как **17px** (было calc≈16.8).
- [x] Сверить `izSpacing` 4…32 с `--iz-space-1…8`.
- [x] Добавить в `packages/design-tokens` mobile-parity ключи: font 2xs…7xl, radius card/cardLg/segmentTab, `izInteraction.disabledOpacity`, `izModalBackdropScrim`. Verify расширен.

### 0.2 Типографика

- [x] Body: web Inter (CSS) / RN `"System"` — **platform-исключение** (документировано в `typography.ts` + `displayTypography.ts`). Inter в Expo не грузим.
- [x] Display Intro: `fontFamilyDisplay` из токенов; загрузка `"Intro"` в `mobile/app/_layout.tsx` подтверждена.
- [x] Шкала `--iz-font-*` (11…28) в `typography.ts`; первый потребитель — `AppButton` (`fontMd` / weights / interaction). Массовый перевод magic numbers — в этапах экранов.

### 0.3 Тени / градиенты / scrim

- [x] `izShadows`: card / elevated / modal / inputFocus (RN recipes) в `packages/design-tokens/src/shadows.ts`.
- [x] `izGradients`: premiumPanel, rafflePink/success, feedIndigo/gold, appIntro, …
- [x] `MODAL_BACKDROP_SCRIM` → `izModalBackdropScrim` из `@izibuy/design-tokens` (`formChromeStyles` re-export).

### 0.4 Layout constants

- [x] Phone gutter 8 / section gap 8 / tabBar extra 16 → `izLayout`; mobile `screenContentLayout` / `screenBreakpoints` читают из пакета.
- [x] Max-width ladder 520/720/960/1200 = web `--app-shell-max-width` (layout-parity green).

### 0.5 Тема runtime

- [x] Light/dark/custom: оба клиента через `resolveIzTheme`.
- [x] Custom page bg `#fafafc` (`izPageBgCustom` / `resolvePageBackground`) — web `index.css` + mobile navigation background.

**DoD этапа 0:** токены не дрифтят; Intro грузится; disabled opacity / modal scrim / gutters 8px едины. ✅

---

# Этап 1 — Базовые UI-компоненты

### 1.1 AppButton

- [x] ALIGNED (этап 0): pad 12×20, r 10, fontMd/600, scale/disabled из `izInteraction`.
- [x] Cart/seller disabled CTA: `opacity 0.6 → theme.interaction.disabledOpacity` (0.55). Premium submit 0.65 оставлен где так на web.

### 1.2 Skeleton

- [x] Mobile `SkeletonShimmer`: duration **1200ms**, shine-блик (gradient-slide), default `borderRadius: 8` (`SKELETON_BORDER_RADIUS`).

### 1.3 SearchInput / search field

- [x] Sellers search: pad **8.8 / 13.6**, font **15.2**, без minH 44; focus → `searchInputFocused` + `izShadows.inputFocus`.
- [x] Header search: radius **14** (было 999), font **15.2**, padY **8.8**, minH **44** (=2.75rem); focus ring wired.

### 1.4 ProductModalShell / modal chrome

- [x] `ProductModalShell` уже **0.88**; AccountRequirement card maxH **88%**.
- [x] Checkout sheet 70%/r32 — не трогали (отдельный паттерн). Bottom sheets 92% — sheet, не ProductModalShell.

### 1.5 InlineErrorBanner

- [x] ALIGNED — без правок.

### 1.6 AccountRequirementModal / ConfirmButton

- [x] AccountRequirement: badge 56 / r12 / pad20 / CTA r10 — ALIGNED; maxH 88%.
- [x] Confirm: native = `Alert`/`window.confirm` (platform). Константы popover chrome в `confirmPopoverChrome.ts` (r14, scrim 58%) для будущей замены Alert.

### 1.7 ProfileListHero (паттерн героев)

- [x] `profileListHeroChrome.ts` + premium / advertising / wishlist / subscriptions / loyalty / dataConfirmation: ls caption **0.6**, value **−1.02**, **без** shadow. Adv radius **20**, остальные **18**.

### 1.8 ModalSectionTabs / ListPageFilterBar

- [x] Tabs: pad **6.4×13.6**, border `focusRing`, font 14/500.
- [x] Filter control: padRight **30** (web `8 30 8 12`); minH 33 / r14 / font 13 — уже были.

### 1.9 Checkbox / Password / Form chrome

- [x] `AppCheckbox` radius → `theme.radius.sm` (8).
- [x] Legacy `useAuthFormStyles` title **28→26**; канон — `useLoginScreenStyles`.

### 1.10 Icons

- [x] `izIconSizes` + `izIconStrokeNav` в design-tokens; tab bar использует их.

**DoD этапа 1:** атомы визуально неотличимы на phone; skeleton/search/hero — главные визуальные дыры закрыты. ✅

---

# Этап 2 — App shell / bottom nav / screen chrome

### 2.1 Bottom nav pill

- [x] Layout numbers ALIGNED (item/primary 46.4, pad 6/7, r pill, float 2).
- [x] Badge `lineHeight` **11 → 8.8** (web `line-height: 1` @ 0.55rem).
- [x] Blur: константы `BLUR_INTENSITY_WEB=18` / `NATIVE=40` + комментарий platform-исключения (expo-blur ≠ CSS px).
- [x] Soft-keyboard hide pill (см. 2.2).

### 2.2 Content insets / overlay

- [x] Формула documented: overlay (pill+float/safe) + **16**; web clearance 3.6rem+0.625rem+safe+block-y — сжато в +16 (намеренно).
- [x] Soft-keyboard: `useSoftKeyboardOpen` → прячет tab pill + PromoReturnStreakDock (паритет `:root.app-soft-keyboard-open`).

### 2.3 Screen states

- [x] `ScreenStates`: pad `spacing[6]`=24, message/error `fontMd`=15 — ALIGNED.

### 2.4 Back button / header circle

- [x] `ScreenBackButton` **40×40** ALIGNED; disabled → `izInteraction.disabledOpacity`.
- [x] Generic `HEADER_CIRCLE_ICON_BUTTON_SIZE=36` (web 2.25rem). Home v2 CTA у поиска = **44** (= search 2.75rem) — не путать.

**DoD этапа 2:** floating pill + insets совпадают; badge/blur осознаны. ✅

---

# Этап 3 — Home feed

Файлы web: `widgets/app-shell`, `displayFont.css`, product/raffle/story entities.  
Mobile: `app/(tabs)/index.tsx`, `features/home-feed/*`, `catalogProductStyles`, `homeFeedSectionTabStyles`, `raffleFeaturedStyles`, `boostProductsHomeStyles`, `promoReturnStreakDockStyles`.

### 3.1 Section tabs

- [x] Web tabs: `padding: 0.5rem 1rem` (8/**16**), `gap: 0.6rem` (**9.6**), font **0.95rem (15.2)**.
- [x] Mobile `homeFeedSectionTabStyles.ts`: `paddingHorizontal: 16`, `gap: 9.6`, `fontSize: 15.2`.

### 3.2 Section titles (Intro)

- [x] Web `.home-feed-section-title` margin **1rem 0** (16/16) / displayFont clamp.
- [x] Mobile `HOME_FEED_DISPLAY_TITLE`: marginTop **8** (+ list gap 8 → 16) / marginBottom **16**; `HOME_CATALOG_SECTION_TITLE_MARGIN_TOP = 16`.

### 3.3 Grid / cards на ленте

- [x] Phone catalog grid gap: web `0.1rem`@≤667 / `0.15rem`@≤903 ↔ mobile `resolveProductGridGap` **2 / 2.4 / 16** — ALIGNED.
- [x] Колонки: ≤667 → 2, ≤903 → 3, ≥1280 → 4 — оба (`SCREEN_PRODUCT_GRID_*` ↔ `AppShell.css`).
- [x] Old price: убран web hardcode `#93c5fd` в `ProductCardMobileCatalog.css`; оба → `ProductPriceDisplay` mix 52% / `BC.priceOld`.

### 3.4 Блоки контента (наличие)

- [x] Порядок: banner → raffles → stories → boost → curated → tabs → grid — web `AppShellCatalogSection` / mobile `HomeFeedListHeader`+`HomeFeedHeader`. Categories/sellers — вкладки. Promo streak dock + filters sheet — оба.
- [x] Site header banner: web `AppShellHeader`, mobile `HomeCatalogSiteHeaderBannerRow` в listHeader — visual order одинаковый (banner первым).

### 3.5 Skeleton home

- [x] `homeFeedSkeletonStyles.ts` + `SkeletonShimmer` (этап 1.2): catalog tiles по MCL, curated/banner placeholders — ALIGNED.

**DoD этапа 3:** вкладки/заголовки/grid gap/old-price политика совпадают. ✅

---

# Этап 4 — Catalog browser

Web: `CatalogBrowserLanding` / categories grid.  
Mobile: `features/catalog-browser/*`, `CATALOG_BROWSER_DISPLAY_TITLE`.

- [x] Title Intro **22/800** — ALIGNED (`CATALOG_BROWSER_DISPLAY_TITLE`); categories title mid **20**.
- [x] Category tiles: gap **6**, radius **12**, cols **3 / ≥641→4 / ≥900→6** (`catalogBrowserGridConstants` ↔ `CatalogCategoriesGrid.css`).
- [x] Subcategory filter flag: mobile `EXPO_PUBLIC_FF_CATALOG_BROWSER_SUBCATEGORY_FILTER` (дефолт true) + gate в `useCatalogSubcategoryPicker` = web.
- [x] Empty/error: loading `PRODUCT_CATEGORY_DISPLAY_UI.LOADING`, error `API_CLIENT_UI.FETCH_CATEGORY_DISPLAYS_FALLBACK`.

**DoD этапа 4:** landing tiles = web phone layout. ✅

---

# Этап 5 — Product cards (атомы карточек)

### 5.1 Catalog mini card

- [x] Image top r **15**, bottom **10**, action H **34.4**, content inset **10**, name **14** — ALIGNED (`PRODUCT_CARD_MOBILE_CATALOG_LAYOUT`).
- [x] Overlay badge: r **6**, pad **2×10**, font **10/12** — оба (`productCardTokens.css` ↔ `PRODUCT_CARD_IMAGE_BADGE_OVERLAY_LAYOUT`).

### 5.2 Compact / list card (wishlist-like)

- [x] Web list thumb **112** / **96@≤640**, pad `0.6/0.7rem` (9.6/11.2), gap `0.55rem` (8.8).
- [x] Mobile `PRODUCT_COMPACT_CARD_LAYOUT` + `productCompactCardStyles`: thumb **112/96**, pad **9.6×11.2**, gap **8.8**, card r **20**.

### 5.3 Squircle

- [x] Product card: mobile `borderCurve: continuous` + web `corner-shape: squircle`, radius `theme.radius.cardLg` (**16**).

**DoD этапа 5:** grid + list cards совпадают по геометрии. ✅

---

# Этап 6 — Product details

Web: `pages/product-details`, `entities/product/ui/product-details-modal/*`.  
Mobile: `app/product/[id].tsx`, `features/product-detail/*`, куски `catalogProductStyles.ts`.

### 6.1 Геометрия / тип

- [x] Old price: `detailOld` → `resolveProductDetailPriceOldColor` (**action@45%** на surface).
- [x] Price row gaps: `detailRoot` **5.6 / 8.8** (= web `0.35rem 0.55rem`).
- [x] Name 17.3, current 29.6 / ls −0.9 — ALIGNED.
- [x] Feature cards: pad 12×14, r 14, title 15.2 — ALIGNED.
- [x] Hero chrome inset 0.65rem (10.4), action 32 — ALIGNED.

### 6.2 Динамика

- [x] Enter/exit **220/180ms** scale **0.96→1** — `ProductDetailsPageEnterShell` + Reanimated (`productDetailsPageEnterAnimation.ts`).

### 6.3 Блоки

- [x] Tabs: details / reviews / auction / installment / QA / compare / similar — `useProductDetailTabs`.
- [x] Dock purchase / qty / blocked — `ProductDetailPurchaseActions` + `BlockedPurchaseButton`.
- [x] Seller preview + thumbs, wholesale, buy-N-free, promotion modal — на месте (smoke via existing parity tests).
- [x] Bottom nav скрыт: product — Stack вне `(tabs)`.

**DoD этапа 6:** цена/gaps/док + полный набор табов. ✅

---

# Этап 7 — Cart / checkout

Web: `pages/cart/*`, `shared/ui/CheckoutForm`.  
Mobile: `app/(tabs)/cart.tsx`, `cartFulfillmentStyles`, `formChromeStyles`, `commerceScreenStyles`, `catalogProductStyles` footer.

### 7.1 Стили

- [x] Dock total `gap`: web **6** → mobile `footerTotalBlock.gap` **6** (`catalogProductStyles.ts`).
- [x] Checkout disabled opacity: web **0.55** → `theme.interaction.disabledOpacity` (**0.55**, design-tokens).
- [x] Unit price in cart: web **17**/700 → mobile `unitPrice` **17** (`commerceScreenStyles.ts`).
- [x] Dock shadow: `stickyFooterShadow` ≈ **0.12 / r18 / y10 / elev16**.
- [x] Line item: image **72**, card r **14**, pad **14×16** — ALIGNED; smoke.
- [x] Page dock r **20**, content inset **12** — ALIGNED.
- [x] Fulfillment cards: r **16**, pad 14/16, marginH 12 — ALIGNED (page dock 20 отдельно).

### 7.2 Контент

- [x] LuckyBox + FortuneWheel wins → `appliedPromos` + `prizeFreeUnits` + auto-add prize (`cart.tsx`, merge libs, queries).
- [x] Cart line: `PRIZE_LINE_BADGE` / hint + game promo labels (`CartLineItem.tsx`).
- [x] Fulfillment / auction / checkout sheet / payment — smoke (`checkout-cart-layout-parity`, `cart-page-copy-parity`).
- [x] CheckoutForm fields: gap **14**, input **9/14**, radio minH **44** — ALIGNED.

**DoD этапа 7:** dock метрики + promo wins + checkout sheet. ✅

---

# Этап 8 — Auth

Web: `pages/auth/*`, `AuthPage.css`, `AuthHeroBanner`.  
Mobile: `(auth)/*`, `formChromeStyles`, `authPageLayout`.

- [x] Column maxW **420**, body pad **24**, title **26/700**, input r **10** pad 12×14 — ALIGNED (`AUTH_PAGE_LAYOUT` + `useLoginScreenStyles`).
- [x] Channel btn pad: web **7.2/10.4** → mobile **7.2/10.4** (`authPageLayout.ts`).
- [x] Hero radius **32** — оба.
- [x] Legacy `useAuthFormStyles` удалён; канон — `useLoginScreenStyles`.
- [x] Legal / forgot / register copy = `AUTH_UI` / `RegisterLegalConsentFields` (`appUiCopy`).

**DoD этапа 8:** login/register/forgot пиксель-близко к web phone. ✅

---

# Этап 9 — Profile

Web: `MyProfilePage*`, `GuestProfilePanel`, nav groups.  
Mobile: `(tabs)/me.tsx`, `profileChromeStyles`, `guestProfileLayout`, `buildProfileNavGroups.ts`.

### 9.1 Стили

- [x] Surfaces r **24**, section gap **6**, avatar **72**, banner H/r — ALIGNED.
- [x] Sidebar title font: web **1.12rem (17.92)** → mobile **17.92** (`MY_PROFILE_SIDEBAR_LAYOUT.titleFontSize`).
- [x] Guest column maxW **420**, hero r **32**.

### 9.2 Контент

- [x] Theme toggle — оба (`ThemePreferenceToggle`; phone ≤640 как web overview-footer).
- [x] Web-only: `WebPushSettingsToggle` не портирован; mobile — `useRemotePushRegistration` (AppRuntimeSync / OS).
- [x] Nav services (`onec`, `delivery-payment`, `courier*`) — WEB_ONLY; mobile nav только `safe-deal` из services.
- [x] Hub sections (wishlist, orders, sales, advertising, premium, …) — те же sectionId.

**DoD этапа 9:** guest/auth overview chrome; web-only пункты не «битые». ✅

---

# Этап 10 — Wishlist / Orders / Sales

### 10.1 Wishlist

- [x] Hero: no shadow + ls caption/value **0.6 / −1.02** (`profileListHeroChrome` + `wishlistPageStyles`).
- [x] List gap **4**, row pad/radius/thumb **6×10.4 / 12 / 64** — ALIGNED.
- [x] List = `WishlistRow` (thumb **64**), не compact-card **112**.

### 10.2 Orders

- [x] Toolbar pad **12**, r **16**, chips **4×8**, stackGap **13.6** — ALIGNED; toolbar bg `surfaceMuted`.
- [x] Order card r **20** — `ORDER_CARD_RADIUS`; detail `/orders/[id]` → `OrderDetailPage`.
- [x] Empty/error/guest (`AppButton` + `ScreenErrorState`).

### 10.3 Sales

- [x] Тот же chrome; toolbar bg **`surface`** (vs orders `surfaceMuted`); guest CTA → `AppButton` как orders.

**DoD этапа 10:** list chrome + heroes без лишних теней. ✅

---

# Этап 11 — Premium / Advertising / Loyalty / Partner / Subscriptions

### 11.1 Premium

- [x] Hero r **18**, pad **20**, warning fill, value **34/800** — ALIGNED (`profileListHeroChrome`).
- [x] Benefits card r **14** pad **16**, gap **12** (web `0.75rem`).
- [x] Submit disabled **0.65** (`submitButtonDisabled`, не AppButton 0.55).

### 11.2 Advertising

- [x] Hero r **20**, infoDeep — ALIGNED.
- [x] Секции ads: intro-ad, personal category, site-header banner, raffle.
- [x] Tabs `ads | games` + `LuckyBoxAdvertisingSection` + `FortuneWheelAdvertisingSection` + `me/config` API.

### 11.3 Loyalty points

- [x] Chrome/hero паритет.
- [x] `createLoyaltyPointsPayment` + pending SecureStore + `useMyPaymentQuery` poll + invalidate balance; stub если `!cardPaymentEnabled`.

### 11.4 Partner program

- [x] Tabs referrals / earnings / **sales** + `AffiliateSalesPanel` + `fetchMyAffiliateSales`.

### 11.5 Subscriptions

- [x] Following **и** followers (`useMyFollowersQuery` + tabs / list param).

**DoD этапа 11:** heroes + games ads + loyalty pay + partner sales + followers. ✅

---

# Этап 12 — Auction / Raffle

### 12.1 Auction

- [x] stackGap 13.6, toolbar r 16, chips soft-warning active — ALIGNED; smoke accept/reject (secondary+success, r12).
- [x] Overview tiles r 16, thumb **52/r12** (=web 3.25rem/12); row pad/gap/r **12/10.4/18** — ALIGNED.

### 12.2 Raffle public

- [x] Featured card r **22**, reveal pill, media H/radius web **300/22** — `raffleFeaturedStyles` / `RaffleProductsPage` (`L.mediaRadius`).
- [x] Create raffle hub — form chrome vs web create flow: section muted/r11.2, media-type muted, CTA minH 44 (не staff queue).

**DoD этапа 12:** auction list + raffle product page visuals. ✅  
Тест: `mobile/scripts/stage12-parity.test.mjs`.

---

# Этап 13 — Create / edit product wizard

Web: create wizard steps + DealTerms + Instagram card.  
Mobile: `CreateProductScreen` / `resolveProductWizardStepIds`.

- [x] **Skip originality** для non-cart deals: `resolveProductWizardStepIds` + `categoryDealType` из picker; submit → `PRODUCT_LISTING_ORIGIN_OWN`.
- [x] **Deal terms** (услуга): `CreateProductDealTermsFields` на commerce + `buildProductDealTermsFields` в create/patch.
- [x] **Instagram URL card** на media step + validate + API passthrough.
- [x] Wizard footer gaps: `WIZARD_FOOTER_BOTTOM_GAP_PHONE=12` / tablet **32** — ALIGNED.
- [x] Progress UI ↔ web: horizontal scroll, minW 72, gap 16, `WIZARD_STEP_OF`.

**DoD этапа 13:** те же шаги/поля, что web, для seller create/edit. ✅  
Тест: `mobile/scripts/stage13-parity.test.mjs`.

---

# Этап 14 — Seller storefront

Web: `SellerProductsPage` + OneC shelves.  
Mobile: `SellerProductsPage.tsx`.

- [x] Shelves / luckybox / wheel / QR / share / social — smoke наличие (уже были; тест фиксирует).
- [x] **Контент-gap:** `usePublicSellerOneCShelvesQuery` + `onecPath` tree + `onecGroupId` в catalog — порт read-only public UI.

**DoD этапа 14:** витрина = web для buyer (включая 1С-полки). ✅  
Тест: `mobile/scripts/stage14-parity.test.mjs`.

---

# Этап 15 — Notifications / Deal-requests / Safe-deal / Misc buyer

- [x] Notifications list/clear/navigate — item pad **12×13.6**, r **8**, gap **8**; clear **6.4×13.6** / r **8** / `actionBorder`.
- [x] Deal-requests card: pad **16**, r **18**, gap **9.6**, closed → `surfaceMuted`; safe-deal header/form **18/16**.
- [x] FAQ / legal — native screens (`FaqScreen`, `LegalDocumentsScreen`).
- [x] User public profile `/user/:id` → `UserDetailsPage`.
- [x] Installment payments — toolbar + `INSTALLMENT_PAGE_LAYOUT` stackGap **13.6**.

Тест: `mobile/scripts/stage15-parity.test.mjs`.

**DoD этапа 15:** вторичные buyer-экраны без визуального дрейфа.

---

# Этап 16 — Динамика / empty / loading (сквозной)

- [x] Buyer-critical load/error/empty/guest — DoD в `mobile/docs/BUYER-CRITICAL-PATH.md` (skeleton OK на home/product).
- [x] Catalog empty + `ThemedRefreshControl`; notifications `ScreenErrorState`; orders empty → каталог; guest login → `AppButton`.
- [x] Press spring **180ms**: `PressableScale` + `AppButton` (`izInteraction`); wired в `AddToCartButton` / wishlist toggle.
- [x] Pull-to-refresh tint = `theme.colors.action` (`ThemedRefreshControl`).
- [x] Mark-read blur: `reportClientIssue` (не silent catch).

Тест: `mobile/scripts/stage16-parity.test.mjs`.

**DoD этапа 16:** states + motion согласованы.

---

# Этап 17 — Visual QA / GATE

- [ ] Phone + LAN (не только localhost): home → product → cart → order → profile — **ручной smoke** (код/доки готовы: `.env.example` → `192.168.*`, `BUYER-CRITICAL-PATH.md`).
- [ ] Themes: light / dark / custom — **ручной visual** (`AppThemeProvider` → `resolveIzTheme`; токены light/dark/custom).
- [x] Чеклист этапы 0–16: открытых `[ ]` buyer blocker нет.
- [x] Прогоны: `npm run regression:wf72` PASS; `npm run verify:design-tokens` ok; stage12–17 parity green.
- [x] Отчёт GATE (ниже).

Тест (статика GATE): `mobile/scripts/stage17-parity.test.mjs`.

```
GATE:
- env matrix: EXPO_PUBLIC_API_URL example = LAN 192.168.*; createClientIdempotencyKey fallback вне secure context; clipboard via expo-clipboard (не navigator.clipboard). Device smoke home→product→cart→order→profile на Phone+LAN — не прогнан в этой сессии.
- money/auth path: loyalty createPayment + idempotencyKey; useMyPaymentQuery invalidate loyaltyPoints + authMe on succeeded; cart createOrder catch → UI error + invalidate orders. OK.
- silent catch: buyer UI silent `catch {}` нет; остались Linking.openURL / Splash / video.play no-ops (platform). Mark-read → reportClientIssue.
- deps/resolve: PressableScale / AppButton / ThemedRefreshControl на reanimated + design-tokens (уже в mobile).
- tests run: regression:wf72 PASS; verify:design-tokens ok; stage12–16 17/17; stage17 5/5.
VERDICT: blocked (ручной smoke: Phone+LAN path + themes light/dark/custom на устройстве)
```

---

## Приоритет внедрения (кратко)

1. **Этап 0** — токены/шрифты (блокер дрейфа)
2. **Этап 1** — Search / Skeleton / Hero (самый заметный UI drift)
3. **Этап 2–7** — shell → home → catalog → cards → product → cart (buyer-critical)
4. **Этап 8–10** — auth / profile / lists
5. **Этап 11** — контентные дыры money/ads (loyalty pay, games ads, partner sales)
6. **Этап 12–16** — auction/raffle/wizard/storefront/states
7. **Этап 17** — GATE

---

## Сводка этапов

| #   | Название                                    | Фокус                                       |
| --- | ------------------------------------------- | ------------------------------------------- |
| 0   | Токены / тема / шрифты                      | design-tokens, Intro, shadows, gutters      |
| 1   | Базовые UI                                  | Button, Skeleton, Search, Modal, Hero, Form |
| 2   | Shell / nav                                 | Bottom pill, insets, back                   |
| 3   | Home feed ✅                                | Tabs, titles, grid, sections                |
| 4   | Catalog browser ✅                          | Landing tiles                               |
| 5   | Product cards ✅                            | Grid + list geometry                        |
| 6   | Product details ✅                          | Price, gaps, tabs, motion                   |
| 7   | Cart / checkout                             | Dock metrics + promo wins                   |
| 8   | Auth                                        | Login chrome                                |
| 9   | Profile                                     | Overview + nav scope                        |
| 10  | Wishlist / Orders / Sales                   | List chrome                                 |
| 11  | Premium / Ads / Loyalty / Partner / Subs ✅ | Heroes + content gaps                       |
| 12  | Auction / Raffle ✅                         | List + featured                             |
| 13  | Product wizard ✅                           | Steps/fields parity                         |
| 14  | Seller storefront ✅                        | 1С shelves                                  |
| 15  | Misc buyer                                  | Notifications, deals, FAQ…                  |
| 16  | Dynamics / states                           | Loading/empty/error/motion                  |
| 17  | Visual QA / GATE                            | Proof                                       |

**Всего этапов: 18 (0–17).**
