# Оплата продвижения товара баллами (v1)

## Решения

| Тема | Решение |
| --- | --- |
| Способы | СБП (дефолт) или баллы 1:1 |
| UX | Тумблер «Оплатить баллами» над кнопкой «Оплатить»; чипы всегда в рублях |
| Дефолт тумблера | выкл |
| Нехватка баллов | кнопка disabled + ссылка «Пополнить баллы» |
| Списание | сразу на submit, активация как после СБП |
| Staff | может оплатить чужой товар со **своих** баллов |
| Mobile | вне v1 |
| awaiting_payment СБП | баллами не добиваем |

## API

`POST /product/:productId/promotions/request`

```json
{ "tier": 1, "tariffCode": "24h", "paymentMethod": "points", "idempotencyKey": "…" }
```

`paymentMethod`: `sbp` (default) | `points`.

При `points`: `requiresPayment: false`, `loyaltyPointsBalance`, статус `active`.
При `sbp`: как раньше → `createPlatformServicePayment`.
