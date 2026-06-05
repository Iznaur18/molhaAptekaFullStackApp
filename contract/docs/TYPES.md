# JSDoc из Zod

Типы: `contract/src/apiTypes.js` → импорт `@molha/api-contract/types`.

Каждый `*Contract` = `z.infer<typeof schema>` (см. комментарии в файле).

В клиенте включён `checkJs` (`client/jsconfig.json`). Парсеры: `client/src/shared/api/parseApiContract.js` с `@returns` на контрактные типы.

Добавление эндпоинта:

1. Zod-схема в `contract/src/*.js`
2. Строка `@typedef` в `apiTypes.js`
3. `parse*Data` + `@returns` в клиенте
