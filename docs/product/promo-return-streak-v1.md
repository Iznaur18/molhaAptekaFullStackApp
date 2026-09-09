# Promo Return Streak v1 (web)

Ежедневная скидка за возвращение на площадку. Явный claim «Забрать скидку».

## Правила

| Параметр | Значение |
|---|---|
| Акторы | все авторизованные |
| Календарь | Europe/Moscow |
| Claim | явная кнопка, не авто |
| Пропуск дня | сброс на день 1 |
| После дня 7 | следующее утро → день 1 |
| Сжигание | после применения к оплате услуги |
| Платформы | web only |

### % по дням

1→5%, 2→10%, 3→20%, 4→30%, 5→50%, 6→75%, 7→95%.

### Услуги

- `product_promotion` (баллы + СБП)
- `site_header_banner`
- `seller_personal_category`
- `raffle_create_unlock`

Не действует на `intro_ad`.

## API

- `GET /user/me/promo-return-streak`
- `POST /user/me/promo-return-streak/claim`

SSOT % и округление: `contract/src/promoReturnStreak.js`.

Списание скидки атомарно: `quoteAndConsumePromoReturnStreakAmount` (day>0 + lastClaim=сегодня → day=0).

## UI

Нижний dock (auth): день N/7, %, завтра, «Забрать скидку» / «активна» / «использована».

Цены на 4 услугах показывают charge с активной скидкой; после оплаты dock инвалидируется.
