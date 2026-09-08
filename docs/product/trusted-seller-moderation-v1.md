# Фича: публикация товаров без модерации для выбранных продавцов (v1)

> **Статус: реализовано (v1).** Сервер (флаг в `UserModel`, bypass в create/patch/1C, admin-эндпоинт
> с аудитом и уведомлением), клиент (тумблер у админа, пометка продавцу), mobile-паритет, тесты.

---

## 1. Зачем

У части продавцов каталог на сотни позиций: каждая карточка ждёт модерации, товар не продаётся,
модераторы тонут в очереди. Админ выдаёт конкретному продавцу доверие — его товары попадают в
каталог сразу.

- **Продавцу:** продаю быстрее, карточка живёт сразу после загрузки.
- **Маркетплейсу:** очередь модерации разгружена, ликвидность выше.
- **Покупателю:** ассортимент актуален, а не отстаёт от модерации на сутки.

---

## 2. Принятые решения (locked)

| #   | Тема                        | Решение                                                                                     |
| --- | --------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | **Носитель доверия**        | Флаг на пользователе `User.productModerationTrusted` (не роль, не отдельная коллекция)      |
| 2   | **Кто включает**            | Только `admin` (`checkAdminMW`), отдельный эндпоинт → попадает в `StaffAuditLog`            |
| 3   | **Что даёт**                | Новый товар создаётся сразу `approved`; в каталоге виден, если `productStockQuantity > 0`   |
| 4   | **Правка контента**         | Уже одобренный товар остаётся `approved`, обновляется только `productModerationApprovedHash` |
| 5   | **Отзыв доверия**           | Ранее одобренные товары остаются в каталоге; на модерацию идут только новые                 |
| 6   | **Товары в `pending`**      | При выдаче доверия автоматически не одобряются — остаются в очереди у модератора            |
| 7   | **1С-импорт**               | Тот же bypass: `processOneCImportJob` → applier и материализация held-карточек               |
| 8   | **Продавец знает о статусе**| In-app уведомление при выдаче/отзыве + пометка в тулбаре «Мои товары»                        |
| 9   | **Видимость флага**         | Отдаём себе и staff; в чужом профиле для обычного зрителя вырезаем                          |
| 10  | **Идемпотентность**         | Повторная выдача того же значения не пишет апдейт и не дублирует уведомление                |

Решение 4 — суть bypass: `skipsModeration` заменил прежнюю проверку `isAdmin` в записи товара,
поэтому «модерацию можно обойти» больше не равно «пользователь админ».

---

## 3. API

| Метод | Путь                                                    | Доступ | Тело               |
| ----- | ------------------------------------------------------- | ------ | ------------------ |
| PATCH | `/staff/sellers/:userId/product-moderation-trust`       | 👑     | `{ trusted: bool }` |

Ответ: `{ success: true, data: { seller: { _id, productModerationTrusted } } }`.
Контракт — `contract/src/productModerationTrust.js`.

---

## 4. Файлы

**Сервер**

- `models/UserModel.js` — поле `productModerationTrusted`.
- `services/product/productModerationTrust.js` — `canSkipProductModeration`,
  `loadProductWriteAccess`, `isSellerProductModerationTrusted`.
- `services/product/setSellerProductModerationTrust.js` — выдача/отзыв + уведомление.
- `services/product/postProduct.js`, `buildProductPatchSet.js`, `patchMyProduct.js` — bypass и fingerprint.
- `services/onec/exchange/{processOneCImportJob,applyOneCCatalogProducts,onecHeldProducts,onecProductFields}.js`
  — bypass в 1С-импорте.
- `controllers/Product/productModerationControllers.js`, `validations/product/productModerationTrustValidation.js`,
  `routes/staffRouter.js` — эндпоинт.
- `constants/constants.js` (`USER_DATA`), `services/user/userProfileVisibility.js` — видимость флага.

**Клиент (web)**

- `entities/user/api/patchSellerProductModerationTrust.js`, `model/useUserProfileMutations.js`.
- `entities/user/ui/AdminProductModerationTrustControl.{jsx,css}` — тумблер в карточке пользователя.
- `widgets/my-products-catalog-toolbar/ui/MyProductsCatalogToolbar.jsx` — пометка продавцу.
- `entities/user/model/useAuthSession.js` → `useAppShellState` → `useHomeMainContentProps`.

**Mobile**

- `entities/user/api/patchSellerProductModerationTrust.ts`,
  `entities/user/ui/AdminProductModerationTrustControl.tsx`.
- `features/user-details-page/{ui/UserDetailsPage.tsx,model/useUserDetailsPage.ts}`.
- `features/my-products-catalog-toolbar/ui/MyProductsCatalogToolbar.tsx`, `features/my-products-page/ui/MyProductsPage.tsx`.

---

## 5. Тесты

- `server/tests/productModerationTrust.integration.test.js` — создание сразу `approved`, правка
  контента без потери одобрения, отзыв доверия (новые → `pending`, старые остаются), права только
  у админа, запись в `StaffAuditLog`, одно уведомление на смену статуса.
- `client/src/entities/user/ui/AdminProductModerationTrustControl.test.jsx`,
  `client/src/widgets/my-products-catalog-toolbar/ui/MyProductsCatalogToolbar.test.jsx`.
- `mobile/scripts/product-moderation-trust-parity.test.mjs` — паритет мобильного пути.

---

## 6. Риски и что не вошло

- Массовое авто-одобрение висящих `pending` при выдаче доверия — отдельная задача (решение 6).
- Доверие бессрочное: авто-отзыв по жалобам/фроду не предусмотрен, только ручной.
- Anti-fraud не проверяет поток от доверенного продавца отдельно — при масштабировании нужен
  сигнал в Risk Score.
