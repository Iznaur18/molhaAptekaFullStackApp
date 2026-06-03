# Паспортные данные (PII)

## Что храним

- Коллекция `UserDataConfirmationRequest`: полный паспорт (серия, номер, ФИО, даты, кем выдан) и URL selfie (`passportSelfiePhotoUrl`).
- Данные нужны только для ручной проверки staff до подтверждения аккаунта.

## Кто видит

| Актор | Доступ |
|-------|--------|
| Покупатель (`GET /user/me/data-confirmation-request`) | Статус заявки, `staffNote` при отклонении. **Без** `passport` и `passportSelfiePhotoUrl`. |
| Staff / модератор (`GET /user/data-confirmation-requests/pending`, resolve) | Полный паспорт и selfie — только с `checkProductModeratorMW`. |
| Продавец, заказы, рассрочка | Паспорт **не** отдаётся в API ответах. |

## Срок хранения (рекомендация v1)

- После `approved`: рассмотреть удаление `passport` / selfie через 90 дней (cron v2).
- После `rejected`: хранить для повторной подачи; при новой заявке — новая запись.

## Что не логировать

- `passport`, `passport.series`, `passport.number`
- `password`, `initData` (legacy)
- Тело запроса целиком в `console.error` при ошибках валидации паспорта

## Маскирование в API

- Покупатель: поля паспорта не возвращаются (`sanitizeDataConfirmationRequestForBuyer`).
- Staff-очередь: полные данные (нужны для проверки в UI).
