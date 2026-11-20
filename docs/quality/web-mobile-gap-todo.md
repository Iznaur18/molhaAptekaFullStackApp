# Web ↔ mobile: расхождения

Источник дизайна — сайт (`client/`, шапка `HOME_HEADER_VARIANT = 2`).
Приложение (`mobile/`) подгоняем под него.

Новый чат: читать этот файл целиком. `[x]` — сделано в приложении. `[ ]` — ещё нет.
Цифры — px при 16px = 1rem. Скриншоты устройств не снимались.

Закоммичено: нижняя панель, шапка v2 (и вне ленты), gutter ленты и каталога, карточка шире 1023px. Весь список не закрыт: смотри «Дальше».

## Решения (16.11.2026, «дефолты ок»)

| # | Вопрос | Решение |
| - | ------ | ------- |
| 1 | Staff, которого в приложении нет | **А.** Не переносить. Deep link этих путей — `null` (`WEB_ONLY_PATHS`). |
| 2 | Розыгрыши и личные категории открывали чужую модерацию | **А.** Прямой адрес открывает свой экран. Пункт меню остаётся один: intro (как на сайте). |
| 3 | С чего начать визуал | **А.** Сначала нижняя панель, потом шапка. |

## Решения catalog path v1 (20.11.2026, «дефолты ок»)

| # | Вопрос | Решение |
| - | ------ | ------- |
| 1 | Scope | Browser landing + drill→home + residual home + filters dig |
| 2 | Personal tiles на `/(tabs)/catalog` | **А.** Убрать (как web landing); личные — вкладка «Продавцы» на home |
| 3 | Drill | **А.** → `/(tabs)` + pending filters |
| 4 | Boost-ряд на home | **А.** SKIP v1 → **снят** (п.6 хвоста: порт на home) |
| 5 | Filters sheet | **А.** Dig parity (убрать mobile-only ranking link) |
| 6 | Staff edit modals на browser | **А.** Не трогать |
| 7 | DoD | Static parity tests + `regression:wf72` |

Карточка товара, чекаут и часть экранов профиля уже закрыты `mobile/scripts/*-parity.test.mjs`.

---

## A. Функции: экрана на сайте нет в приложении

Решение 1А: экраны не рисуем. Ссылка с сайта на эти пути в приложении не открывает заглушку.

- [x] **1С** `/profile/onec-integration` — `WEB_ONLY_PATHS`, deep link `null`.
- [x] **Стать курьером** `/become-courier` — `WEB_ONLY_PATHS`.
- [x] **Обзор курьера** `/courier-overview` — `WEB_ONLY_PATHS`.
- [x] **Модерация курьеров** `/courier-moderation` — `WEB_ONLY_PATHS`.
- [x] **Модерация безопасной сделки** `/safe-deal-moderation` — `WEB_ONLY_PATHS`.
- [x] **Споры по доставке** `/shipment-disputes` — `WEB_ONLY_PATHS`.
- [x] **Службы доставки (админ)** `/shipping-carriers` — `WEB_ONLY_PATHS`.
- [x] **Аналитика** `/admin-analytics` — `WEB_ONLY_PATHS`.
- [x] **Журнал действий staff** `/staff-audit-log-admin` — `WEB_ONLY_PATHS`.
- [x] **Рассылка уведомлений** `/broadcast-notifications-admin` — `WEB_ONLY_PATHS`.
- [x] **Доставка и оплата продавца** `/profile/delivery-payment` — `WEB_ONLY_PATHS` → `null` (меню hub не раздували; thin in-app — seller dig).

Пункт меню в приложении по-прежнему может открыть web SPA (`openProfileStaffWebSection`) или заглушку hub. Это не deep link.

## B. Функции: экран есть, открывается не тот

- [x] **Розыгрыши staff** `/staff-raffles` → `/hub/raffles` → `RafflesStaffPage`. Редирект на intro снят.
- [x] **Модерация личных категорий** `/moderation-seller-categories` → `/hub/seller-personal-category-moderation` → `SellerPersonalCategoryModerationPage`. Редирект на intro снят.
- [x] **Продвижения товаров (staff)** `/product-promotions`. Сайт и приложение оба уводят на модерацию товаров. Отдельную страницу не подключаем.
- [x] **Заказ целиком**. `/orders/[id]` + `OrderDetailPage` (OrderCard + buyer CTA). Deep link `/orders/:id` и `/my-orders/:id`. Tap шапки в списке → деталь.

## C. Дизайн: нижняя панель

Сайт: `client/src/widgets/mobile-bottom-nav/ui/MobileBottomNav.css`.
Приложение: `mobile/shared/ui/MobileBottomTabBar.tsx`.

- [x] Подписи: «Главная», «Категории», «Корзина», «Профиль». Шрифт 10.56px, weight 600, зазор до иконки 2.4px. У «+» подписи нет, как на сайте.
- [x] Иконка каталога — `LayoutGrid`, не гамбургер. Набор иконок — lucide, как на сайте.
- [x] «+» — круг 46.4px, заливка `action`, иконка `onContrast`, тень `0 6 16` opacity 0.35.
- [x] Ячейка min-height 46.4, padding 4 × 2.4, radius 17.6.
- [x] Активная ячейка: цвет `action`, фон mix `onContrast` 42% + `actionSoft`, тени нет.
- [x] Hover на сайте не переносим (натив).
- [x] Pill: тень снята, рамка 1px mix `onContrast` 42% + `border`, фон surface 55%. Blur 18px + saturate 1.35 на Expo web. Градиент 165° с сайта в RN без `expo-linear-gradient` не повторен — заливка плоская.
- [x] Отступ снизу: `FLOAT_OFFSET = 2` + max(safe-area, 12).
- [x] Зазор табов 1.6px.
- [x] Бейдж: top −4.8, right −6.4. Размер 15×15 и шрифт 8.8 как были.
- [x] Карточка товара `/product/[id]` — экран корневого стека, не внутри `(tabs)`, нижняя панель его не рисует.

## D. Дизайн: шапка главной (вариант 2)

Живой макет сайта (`AppShellHeader` + `AppShell.css` v2): панель прозрачная, поиск белый, фильтр и меню — оранжевые квадраты 44×44 radius 14. Правило «белый фильтр 42px / radius 12» висит на `.app-shell__header-filter`, в шапке этот класс не используется. Под него приложение не ровняем.

- [x] Капсула на ленте снята. `panelFloating`: radius 0, без рамки, без стекла, без тени.
- [x] Поиск: фон `surface`, рамка text 6% (`0F`), тень `0 4 14` opacity 0.06, шрифт 16px, line-height 20. Высота 44 и radius 999 как были.
- [x] Фильтр и меню: 44×44, radius 14, заливка `action`, тень offset 6 / opacity 0.55 / radius 10.
- [x] Регион убран отдельной кнопкой. Пункт `location-on` внутри меню, открывает `RuRegionPickerSheet`. Как `buildHeaderUsersMenuItems({ includeRegion })` на сайте.
- [x] Горизонтальный padding плавающей панели в стиле: 8px (0.5rem), не 10. На ленте ряд обнуляет его: список уже даёт gutter.
- [x] Ozon-панель снята. И лента, и каталог с фильтрами рисуют v2: без капсулы, стекла, hairline и нижних углов 18. Вне ленты боковой padding шапки = gutter (8 / 12 / 16). Внутри ленты свой padding панели 0 — отступ уже даёт список.

## E. Дизайн: ещё не сверено

- [x] Gutter ленты и каталога. Сайт: ≤640 — 8px (`0.5rem`), 641–667 — 12px (`0.75rem` в `@media 667`), шире — 16px (`--iz-space-4`). `resolveScreenContentInlinePadding` + `useScreenLayout`. Сетка товаров на главной берёт этот padding.
- [x] Остальные экраны. Page gutter через `createThemedStyles` → `layout.contentPaddingHorizontal` (8 / 12 / 16 + safe-area). Shell-нули (`listInAccountShell`) не трогали.
- [x] Сетка товаров шире 903px — 16px (`1rem`), `resolveProductGridGap`. Телефон ≤667 — 2px: на сайте 2px включает `@media 640`, который перекрывает `0.1rem`.
- [x] Карточка каталога. До 1023px сайт ставит `padding: 0 0 10px` и inset 10px (`ProductCardMobileCatalog.css` перекрывает `0.55rem 0.75rem 0.65rem`). Приложение: `cardCatalogGrid`. Шире 1023px — padding 8.8 / 12 / 10.4, gap карточки 6.4, gap тела 5.12, bleed картинки 8 / 6.08.

## F. Что не расхождение

Одинаковые маршруты покупателя: главная, каталог, карточка, корзина, избранное, подписки, заказы, продажи, мои товары, аукцион, рассрочка, премиум, баллы, партнёрка, реклама, подтверждение данных, сделки, безопасная сделка, уведомления, FAQ, юр.страницы, логин, регистрация, забытый пароль, витрина продавца, розыгрыш-витрина, публичный профиль, мастер товара.

Ширина колонки 520 / 720 / 960 / 1200 совпадает с `resolveContentMaxWidth`.

## Прогон 16.11.2026

`npm run test:home-catalog-search-row`, `test:screen-content-layout`, `test:layout-parity`, `test:screen-layout` — зелёные на срезе шапки, gutter и карточки.

## Дальше

1. ~~Статичный gutter 8px на экранах вне ленты (E)~~ — закрыто: `layout.contentPaddingHorizontal`.
2. ~~Boost-ряд на home~~ — закрыто: `BoostProductsHomeSection` + `useProductPromotionBoostProductsQuery` (порядок stories→boost→curated).
3. ~~Orphan catalog chips~~ — удалены `CatalogCategoryChips` / `CatalogSubcategoryChips` / `CatalogSearchBar` + стили/`CATALOG_FILTER_UI`.
4. ~~Экран заказа `/orders/:id`~~ — закрыто.
5. ~~delivery-payment (gap-todo A)~~ — закрыто: `WEB_ONLY` → `null`.
6. ~~п.10 dig~~ — закрыто v1: story viewer → `/user/:id` (+ self my-products); `create-raffle-parity` под reveal-only home; staff docs = гибрид 15 in-app + 3 web-only. SKIP: seller services nav, partner sales-tab, raffle CTA visual.
7. ~~п.11 Store/MP docs sync~~ — закрыто v1: privacy copy ↔ `privacy.html`; Post-mobile таблица (push/GDPR ✅; AASA/EAS/Samsung open/отложен). Код фич не трогали.
