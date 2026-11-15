# Web ↔ mobile: расхождения

Источник дизайна — сайт (`client/`, шапка `HOME_HEADER_VARIANT = 2`).
Приложение (`mobile/`) подгоняем под него.

Новый чат: читать этот файл целиком. `[x]` — сделано в приложении. `[ ]` — ещё нет.
Цифры — px при 16px = 1rem. Скриншоты устройств не снимались.

Срез шапки ленты, нижней панели и адресов розыгрышей/личных категорий закоммичен. Весь список не закрыт: смотри «Дальше».

## Решения (16.11.2026, «дефолты ок»)

| # | Вопрос | Решение |
| - | ------ | ------- |
| 1 | Staff, которого в приложении нет | **А.** Не переносить. Deep link этих путей — `null` (`WEB_ONLY_PATHS`). |
| 2 | Розыгрыши и личные категории открывали чужую модерацию | **А.** Прямой адрес открывает свой экран. Пункт меню остаётся один: intro (как на сайте). |
| 3 | С чего начать визуал | **А.** Сначала нижняя панель, потом шапка. |

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
- [ ] **Доставка и оплата продавца** `/profile/delivery-payment`. Своего экрана нет. Deep link схлопывается в `/profile` → «Мой профиль», потому что первый сегмент `profile` есть в таблице. Надо либо `null`, либо оставить как есть — отдельно не решали.

Пункт меню в приложении по-прежнему может открыть web SPA (`openProfileStaffWebSection`) или заглушку hub. Это не deep link.

## B. Функции: экран есть, открывается не тот

- [x] **Розыгрыши staff** `/staff-raffles` → `/hub/raffles` → `RafflesStaffPage`. Редирект на intro снят.
- [x] **Модерация личных категорий** `/moderation-seller-categories` → `/hub/seller-personal-category-moderation` → `SellerPersonalCategoryModerationPage`. Редирект на intro снят.
- [x] **Продвижения товаров (staff)** `/product-promotions`. Сайт и приложение оба уводят на модерацию товаров. Отдельную страницу не подключаем.
- [ ] **Заказ целиком**. `/orders/<id>` схлопывается в список. Отдельного экрана заказа нет.

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
- [x] Горизонтальный padding плавающей панели: 8px (0.5rem), не 10.
- [ ] Ozon-панель (`styles.panel`, нижние углы 18, hairline, accent) всё ещё включается, когда `floating={false}` — это не лента главной (`showHomeFeed === false`). На сайте v2 этой шапки нет.

## E. Дизайн: ещё не сверено

- [ ] Gutter шире 640px. Сайт возвращает 16px (`--iz-space-4`). Приложение держит 8px на всех ширинах.
- [ ] Сетка товаров шире 903px на сайте `1rem`. На телефоне 2px совпадает (`layout-parity`).
- [ ] Карточка каталога: padding `0.55rem 0.75rem 0.65rem` со `catalogProductStyles.ts` по пикселям не сверялась.

## F. Что не расхождение

Одинаковые маршруты покупателя: главная, каталог, карточка, корзина, избранное, подписки, заказы, продажи, мои товары, аукцион, рассрочка, премиум, баллы, партнёрка, реклама, подтверждение данных, сделки, безопасная сделка, уведомления, FAQ, юр.страницы, логин, регистрация, забытый пароль, витрина продавца, розыгрыш-витрина, публичный профиль, мастер товара.

Ширина колонки 520 / 720 / 960 / 1200 совпадает с `resolveContentMaxWidth`.

## Прогон 16.11.2026

`npm run test:home-catalog-search-row`, `test:screen-content-layout`, `test:layout-parity`, `test:deep-link-routes`, `node --test scripts/ru-region-picker-sheet.test.mjs`, `node scripts/intro-ad-moderation-merge.test.mjs` — зелёные.

## Дальше

1. Ozon-шапка вне ленты (последний пункт D).
2. Блок E.
3. Блок A и экран заказа — только по отдельной команде.
