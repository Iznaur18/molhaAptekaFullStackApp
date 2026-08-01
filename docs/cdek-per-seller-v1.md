# СДЭК v1 — per-seller (зафиксировано)

**Статус:** спека согласована, код не начат. Ждём API-ключ продавца (test).  
**Источник:** диалог про доставку / СДЭК (модель per-seller).

## Контекст в коде сейчас

- Доставка **продавцом** — live (`PRODUCT_DELIVERY_FULFILLMENT_ENABLED`).
- СДЭК / Яндекс / Почта — scaffold: ids, kill-switch `false`, stub 501, UI «Скоро».
- Нет веса/габаритов на товаре; `POST /order` без `shippingProvider`.

Каркас: `contract/src/shippingProvider.js`, `server/services/shipping/`, UI `CheckoutShippingProviderPicker`.

## Модель кабинета (решение)

**B — у каждого продавца свой кабинет и API-ключ.**  
Не единый кабинет платформы. Не гибрид v1.

- Ключи: encrypt at rest, mask в UI, revoke.
- Нет ключа → СДЭК для товаров продавца недоступен (самовывоз / доставка продавцом остаются).
- Quote / create / track — credentials **этого** продавца.
- Деньги со СДЭК — на договоре продавца; платформа не платит СДЭК за его отправки.

## Scope v1

| Тема | Решение |
| --- | --- |
| Провайдер | Только `cdek`; Яндекс/Почта locked |
| Checkout | Seller-delivery + СДЭК (если ключ ok) |
| Тип | Только ПВЗ |
| ПВЗ | Выбор через API СДЭК |
| Quote | Обязателен до оформления |
| Вес/габариты | Дефолты платформы + опциональные поля |
| Доставка в заказе | `shippingAmount` в `totalAmount` (факт тарифа; оплата как сейчас без шлюза) |
| Мультиселлер | Один продавец на СДЭК-заказ |
| Накладная | Кнопка продавца в «Мои продажи», не авто при checkout |
| Подключение | Ручной ввод account + secure в профиле |
| Validate ключа | При сохранении (token/test request) |
| Staff | Видит «СДЭК подключён: да/нет», без секретов |
| Трекинг | Из create + UI; webhook — позже |
| Отмена | Только наш `cancelled` в v1 |
| UI | Уточнить: web first vs web+mobile (дефолт допускался web first) |

## От пользователя к старту кода

1. Test API-ключ СДЭК (account + secure) — в `.env` / UI, **не в чат**.
2. Инструкция/ссылка: как продавец берёт ключи в кабинете СДЭК.
3. Подтверждение: «дефолты ок» по таблице + п. UI (web / web+mobile).

## Не делать в v1

- Платформенный CDEK client для боевых отправок продавцов.
- Яндекс / Почта.
- Авто-create shipment на checkout.
- Webhook-статусы (фаза 2).
- OAuth СДЭК (если не попросите иначе).

## Следующий шаг при возврате

1. «Есть test-ключ, дефолты ок / правки: …»
2. Agent mode → «готово, реализуй СДЭК per-seller по спеке»
3. Сначала: seller credentials + quote/ПВЗ + order fields + кнопка create shipment.

## Связанные файлы (ориентиры)

- `contract/src/shippingProvider.js` — ids, flags, tracking URL helpers
- `server/services/shipping/shippingProviderRegistry.js` — stub `quote` / `createShipment` / `getTracking`
- `server/models/OrderModel.js` — stub-поля `shippingProvider*`, `shippingTracking*`
- Checkout UI: `CheckoutShippingProviderPicker` (web + mobile)
