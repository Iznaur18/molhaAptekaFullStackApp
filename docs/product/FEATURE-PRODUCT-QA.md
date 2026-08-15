# Фича: «Вопросы и ответы» к товару (Product Q&A)

> Рабочий документ для реализации. Требования и решения зафиксированы (§2), дальше —
> пошаговый план по файлам.
>
> **Статус: реализовано (v1).** Contract + сервер (модель, сервис, роуты, каскады,
> нотификация продавцу) + клиент (слайс `entities/product-qa`, таб в модалке, тумблер
> в управлении). Серверные тесты — `server/tests/productQuestion.test.js` (11/11 pass:
> лимит 50, гонка, видимость pending, права, скрытие/удаление). Lint 0 ошибок, `vite build` ок.
> Не вошло в v1 (см. §11): уведомление покупателю об ответе (оставлен TODO в `answerProductQuestion`).

---

## 1. Что делаем

- В **управлении товаром** продавец включает тумблер **«Вопросы и ответы»** (per-product).
- В **деталях товара** появляется новый таб **«Вопросы и ответы»**.
- В табе — **вопросы от покупателей** и **ответы продавца** на них.
- На один товар — **максимум 50 активных вопросов** (в обсуждении снизили со 100).
- **Вопрос публичен только после ответа продавца** (см. §2, решение о видимости).

Full-stack фича по образцу существующего слайса **отзывов** (`product-review`) — наш эталон:
тот же путь `contract → server (model/constants/validation/service/controller/route) →
client (entity FSD) → таб в модалке товара`. По документу ссылаюсь на файлы-образцы.

---

## 2. Принятые решения (locked)

| # | Тема                    | Решение                                                                                 |
| - | ----------------------- | -------------------------------------------------------------------------------------- |
| 1 | **Видимость вопроса**   | Публичен **только после ответа продавца**. Неотвеченный видят автор + продавец + модератор |
| 2 | **Барьер на вопрос**    | Авторизация + rate-limit. Подтверждённые данные **не** требуем. Продавец свой товар спрашивать не может |
| 3 | **Тумблер OFF**         | Скрыть таб у покупателей, **данные сохранить** (обратимо). Владельцу таб виден всегда   |
| 4 | **Уведомления v1**      | Только **продавцу о новом вопросе** (`UserInAppNotification`). Покупателю об ответе — TODO/отдельный тикет |
| 5 | **Редактирование вопроса** | Автор может **удалить** свой вопрос в окне, редактировать нельзя. Ответ продавца — редактируемый |
| 6 | **Анонимность**         | Показываем `userName` автора. Не анонимно                                               |
| 7 | **Скрытие спама**       | Продавец и модератор переводят вопрос в `hidden`. Скрытый **освобождает слот** из 50    |
| 8 | **Сортировка**          | **Сначала отвеченные** (`answeredAt` desc), затем без ответа (`createdAt` desc). Продавцу — фильтр `?status=pending` для очереди |
| 9 | **Счётчик**             | На табе «Вопросы · N» (публичных). «N/50» — только продавцу в управлении                |
| 10 | **Товар на модерации** | Вопросы только на **одобренный** товар. Владельцу таб виден всегда                      |
| 11 | **Лимиты текста**      | Вопрос ≤ **300** символов, ответ ≤ **300** символов                                     |
| 12 | **Лимит на товар**     | **50** активных вопросов (`pending` + `answered`). `hidden` не считается                |
| 13 | **Один ответ, не тред** | Один ответ продавца на вопрос (редактируемый). Обсуждение-тред — вне скоупа v1          |
| 14 | **Каскады**            | Удаление товара → удаляем его вопросы (в сервисе, не хуком). Удаление юзера → вопрос/ответ остаётся, автор показывается как «Пользователь удалён» |

---

## 3. Доменная модель и инварианты

**Сущность `ProductQuestion`** (одна запись = вопрос + опциональный ответ продавца):

| Поле                | Тип                             | Заметки                                          |
| ------------------- | ------------------------------- | ------------------------------------------------ |
| `productId`         | ObjectId → Product              | required, индекс                                 |
| `authorUserId`      | ObjectId → User                 | required — кто спросил                            |
| `text`              | String                          | required, trim, `1..300`                         |
| `answer.text`       | String                          | trim, `1..300`; есть только у `answered`         |
| `answer.answeredBy` | ObjectId → User                 | продавец (аудит; всегда == `productSeller`)      |
| `answer.answeredAt` | Date                            |                                                  |
| `status`            | enum `pending/answered/hidden`  | default `pending`                                |
| `timestamps`        | createdAt / updatedAt           | `{ timestamps: true }`                           |

**Состояния (`status`) — ключевое отличие от отзывов:**
- `pending` — задан, ждёт ответа. Виден **только** автору + продавцу + модератору. Считается в лимите 50.
- `answered` — продавец ответил → **публично**. Считается в лимите 50.
- `hidden` — скрыт продавцом/модератором. Не виден никому, кроме модерации. **Не** считается в лимите (освобождает слот).

**Инвариант «`answered` ⇒ есть `answer.text`»** — гарантируем в сервисе (ответ и смена
статуса — одной операцией).

**Индексы** (образец `ProductReviewModel.js:44`):
```js
ProductQuestionSchema.index({ productId: 1, status: 1, answeredAt: -1 }); // публичная лента + очередь продавца
ProductQuestionSchema.index({ productId: 1, createdAt: -1 });             // вторичная сортировка
ProductQuestionSchema.index({ authorUserId: 1, createdAt: -1 });          // "мои вопросы"
```
> **НЕ** делаем unique по `(productId, authorUserId)` — один юзер может задать несколько вопросов.

**Инвариант «≤ 50 активных вопросов».** Атомарно через счётчик на товаре — §8.

**Флаги на `ProductModel`:**
- `productQaEnabled` (Boolean, default `false`) — тумблер (образец `productDeliveryEnabled`, `ProductModel.js:178`).
- `productQuestionCount` (Number, default `0`, min `0`) — счётчик активных (`pending`+`answered`); страж лимита 50.

---

## 4. Contract-слой (`contract/src/`)

Образец: `contract/src/productReview.js` + регистрация в `index.js` и `apiTypes.js`
(порядок из `contract/docs/TYPES.md`: Zod-схема → `@typedef` → парсер в клиенте).

**Новый файл `contract/src/productQuestion.js`:**
```js
/** Синхрон с server/constants/productQuestionConstants.js */
export const PRODUCT_QUESTION_TEXT_MAX_LENGTH = 300;
export const PRODUCT_ANSWER_TEXT_MAX_LENGTH = 300;
export const PRODUCT_QUESTIONS_MAX_PER_PRODUCT = 50;
export const PRODUCT_QUESTION_LIMIT_DEFAULT = 20;
export const PRODUCT_QUESTION_LIMIT_MAX = 50;
```
Схемы:
- `askProductQuestionBodySchema` — `{ text: string 1..300 (trim) }`
- `answerProductQuestionBodySchema` — `{ text: string 1..300 (trim) }`
- `productQuestionsListQuerySchema` — `{ page, limit, status? }` (`status` — опц. `pending|answered`
  для очереди продавца; образец `productReviewsListQuerySchema`, `productReview.js:39`)
- `questionIdParamsSchema` — `{ productId, questionId }` (mongoId, образец `reviewIdParamsSchema`)

**Регистрация:**
- `contract/src/index.js` — реэкспорт.
- `contract/src/apiTypes.js` — `@typedef` для `ProductQuestionContract`, `ProductQuestionAnswerContract`,
  ответов списка/summary.
- `contract/src/productFromApi.js` — добавить `productQaEnabled` в `productFromApiSchema`
  (иначе клиент не увидит флаг товара).
- `contract/src/productWrite.js` — `productQaEnabled: z.coerce.boolean().optional()` в
  `patchFieldShape` (образец `productAuctionEnabled`, `productWrite.js:283`).

---

## 5. Server

### 5.1 Константы — `server/constants/productQuestionConstants.js`
Образец: `productReviewConstants.js`.
```js
export const PRODUCT_QUESTION_STATUS_PENDING = "pending";
export const PRODUCT_QUESTION_STATUS_ANSWERED = "answered";
export const PRODUCT_QUESTION_STATUS_HIDDEN = "hidden";
export const PRODUCT_QUESTION_STATUSES = [ /* pending, answered, hidden */ ];
/** Активные статусы, считающиеся в лимите 50. */
export const PRODUCT_QUESTION_ACTIVE_STATUSES = [ /* pending, answered */ ];

export const PRODUCT_QUESTION_TEXT_MAX_LENGTH = 300;
export const PRODUCT_ANSWER_TEXT_MAX_LENGTH = 300;
export const PRODUCT_QUESTIONS_MAX_PER_PRODUCT = 50;

export const PRODUCT_QUESTION_PAGE_DEFAULT = 1;
export const PRODUCT_QUESTION_LIMIT_DEFAULT = 20;
export const PRODUCT_QUESTION_LIMIT_MAX = 50;
export const PRODUCT_QUESTION_DELETE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export const PRODUCT_QUESTION_RATE_LIMIT_PER_HOUR = 20;

export const PRODUCT_QUESTION_MESSAGES = {
  PRODUCT_NOT_FOUND: "Товар не найден",
  QUESTION_NOT_FOUND: "Вопрос не найден",
  QA_DISABLED: "Вопросы и ответы отключены для этого товара",
  NOT_APPROVED: "Вопросы доступны только на одобренные товары",
  OWN_PRODUCT: "Нельзя задать вопрос на свой товар",
  LIMIT_REACHED: "Достигнут лимит в 50 вопросов на товар",
  ONLY_SELLER_CAN_ANSWER: "Отвечать может только продавец товара",
  CANNOT_ANSWER_HIDDEN: "Нельзя ответить на скрытый вопрос",
  DELETE_WINDOW_EXPIRED: "Срок удаления вопроса истёк",
};
```

### 5.2 Модель — `server/models/ProductQuestionModel.js`
Образец: `ProductReviewModel.js`. Схема из §3, `enum` статуса из констант, вложенный
`answer`, три индекса, `{ timestamps: true }`. Экспорт в `server/models/index.js`.

### 5.3 `server/models/ProductModel.js`
Рядом с `productDeliveryEnabled` (≈ строка 178):
```js
/** Тумблер «Вопросы и ответы» на карточке товара. */
productQaEnabled: { type: Boolean, default: false },
/** Кол-во активных (pending+answered) вопросов; страж лимита 50. */
productQuestionCount: { type: Number, default: 0, min: 0 },
```

### 5.4 Валидации — `server/validations/product/productQuestionValidation.js`
Образец: `productReviewValidation.js` (тонкие обёртки над Zod):
`askProductQuestionValidation`, `answerProductQuestionValidation`,
`productQuestionsListValidation`, `productQuestionIdParamValidation`.
Экспорт в `server/validations/index.js`.

### 5.5 Сервис — `server/services/product/productQuestion.js` (+ `productQuestionHelpers.js`)
Образец: `services/product/productReview.js`. Функции:

| Функция                     | Роут                                              |
| --------------------------- | ------------------------------------------------- |
| `listProductQuestions`      | `GET /product/:productId/questions`               |
| `getProductQuestionSummary` | `GET /product/:productId/questions/summary`       |
| `askProductQuestion`        | `POST /product/:productId/questions`              |
| `answerProductQuestion`     | `PUT /product/:productId/questions/:qId/answer`   |
| `deleteMyProductQuestion`   | `DELETE /product/:productId/questions/:qId`       |
| `hideProductQuestion`       | `PATCH /product/:productId/questions/:qId/hide`   |

**Viewer-aware видимость списка** (следствие решения №1) — фильтр зависит от зрителя:
```js
// Продавец-владелец: вся очередь, кроме скрытых (плюс ?status фильтр).
if (isSeller) filter = { productId, status: { $in: ACTIVE_STATUSES } };
// Покупатель/гость: только отвеченные + СВОИ ожидающие.
else filter = {
  productId,
  $or: [
    { status: "answered" },
    ...(viewerUserId ? [{ status: "pending", authorUserId: viewerUserId }] : []),
  ],
};
```
**Сортировка** (решение №8): `{ answeredAt: -1, createdAt: -1 }` — отвеченные сверху
(у `pending` нет `answeredAt`, в desc уходят вниз), внутри — по свежести.

**Проверки** (образцы `canAccessProductReviews`, `assertCanSubmitProductReview`):
- **Доступ к списку**: товар есть; (`productQaEnabled` **и** товар одобрен) **или** зритель — владелец.
- **Задать вопрос**: авторизован; товар одобрен и `productQaEnabled`; зритель ≠ продавец
  (`OWN_PRODUCT`); лимит не достигнут (§8). Статус нового = `pending`.
  → **TODO(v1): нотификация продавцу** (`UserInAppNotification`), см. §11.
- **Ответить**: зритель — продавец товара (иначе `ONLY_SELLER_CAN_ANSWER`); вопрос есть и
  `status ≠ hidden` (иначе `CANNOT_ANSWER_HIDDEN`). Пишем `answer.{text,answeredBy,answeredAt}`,
  `status → answered` одной операцией. Повторный вызов = редактирование ответа (статус уже `answered`).
  → **TODO(post-v1): нотификация автору вопроса** об ответе.
- **Удалить свой вопрос**: автор + окно `PRODUCT_QUESTION_DELETE_WINDOW_MS`. При удалении
  активного — декремент `productQuestionCount` (§8).
- **Скрыть**: продавец товара или модератор (`checkProductModeratorMW`). `status → hidden`,
  декремент счётчика.

Сериализация автора — `AUTHOR_PUBLIC_SELECT = "_id userName isUserDataConfirmed"`
(`productReview.js:21`). **Удалённый автор** (populate вернул `null`) → отдаём
`{ userName: "Пользователь удалён" }` (решение №14).

`getProductQuestionSummary` → `{ publicCount, pendingCount, activeCount, remaining,
qaEnabled, canAsk }` (`pendingCount` — только для продавца; `remaining = 50 - activeCount`).

### 5.6 Контроллеры — `server/controllers/Product/productQuestionControllers.js`
Образец: `productReviewControllers.js`. Тонкие: `req.params/body/userId` → сервис →
`successRes`. Реэкспорт в `server/controllers/index.js`.

### 5.7 Роуты — `server/routes/productRouter.js`
Рядом с блоком reviews (`productRouter.js:565-598`). Конкретные пути — раньше `/:productId`:
```
GET    /:productId/questions/summary            productIdParamValidation, checkOptionalAuthMW
GET    /:productId/questions                     productIdParamValidation, productQuestionsListValidation, checkOptionalAuthMW
POST   /:productId/questions                     checkAuthMW, productQuestionRateLimiter, productIdParamValidation, askProductQuestionValidation
PUT    /:productId/questions/:questionId/answer  checkAuthMW, productQuestionIdParamValidation, answerProductQuestionValidation
PATCH  /:productId/questions/:questionId/hide    checkAuthMW, productQuestionIdParamValidation   (владелец-товара ИЛИ модератор — проверка в сервисе)
DELETE /:productId/questions/:questionId         checkAuthMW, productQuestionIdParamValidation
```
Импорты контроллеров/валидаций — дописать в существующие списки шапки роутера.

### 5.8 Rate limit — `server/middlewares/`
`productQuestionRateLimiter` (образец `productReviewRateLimiter`,
лимит `PRODUCT_QUESTION_RATE_LIMIT_PER_HOUR`). Реэкспорт в `middlewares/index.js`.

### 5.9 Каскад при удалении товара (решение №14)
Там, где товар удаляется (`deleteMyProductController` / сервис товара) — дописать
`ProductQuestionModel.deleteMany({ productId })` рядом с удалением отзывов/просмотров
(как уже делается для связанных коллекций).

---

## 6. Client (FSD-слайс `entities/product-qa/`)

Зеркалим `client/src/entities/product-review/`:

```
entities/product-qa/
├── api/
│   ├── fetchProductQuestionsPage.js      (образец fetchProductReviewsPage.js)
│   ├── fetchProductQuestionSummary.js
│   ├── askProductQuestion.js             (образец submitProductReview.js)
│   ├── answerProductQuestion.js
│   ├── deleteMyProductQuestion.js
│   └── hideProductQuestion.js
├── model/
│   ├── constants.js
│   ├── types.js                          (@typedef ProductQuestionFromApi + answer)
│   ├── productQuestionQueryKeys.js
│   ├── useProductQuestionsQuery.js
│   └── useProductQuestionMutations.js    (ask/answer/delete/hide → invalidate)
├── lib/
│   └── productQuestionQueryCache.js      (invalidateAllProductQuestionQueries)
└── ui/
    ├── ProductQaSection.jsx              (контейнер таба)
    ├── ProductQaSection.css
    ├── ProductQuestionForm.jsx           (задать вопрос, счётчик 300 символов)
    ├── ProductQuestionListItem.jsx       (вопрос + ответ / форма ответа продавца / бейдж «Ждёт ответа»)
    └── ProductQaSummary.jsx              (счётчик N/50 для продавца)
```

**Мутации** (`useProductQuestionMutations`) — `ask/answer/delete/hide`, каждая на
`onSuccess` → `invalidateAllProductQuestionQueries(queryClient, productId)`
(1:1 с `useProductReviewMutations.js`).

**Логика UI по ролям** (`ProductQaSection`):
- Гость → список публичных (отвеченных) read-only + CTA «войти, чтобы задать вопрос».
- Покупатель → форма вопроса (если `canAsk` и `remaining > 0`); видит публичные +
  **свои ожидающие** с бейджем «Ждёт ответа».
- Продавец-владелец (`isOwnProduct`) → форму вопроса НЕ показываем; на `pending` —
  форма ответа; на `answered` — редактирование ответа; на любом — «Скрыть». Счётчик N/50.
- `remaining === 0` → форма скрыта, «Достигнут лимит 50 вопросов».

### 6.1 Таб в модалке товара
- **`ProductDetailsModalQaTab.jsx`** (образец `ProductDetailsModalReviewsTab.jsx`) —
  обёртка над `ProductQaSection`.
- **`ProductDetailsModalTabs.jsx`** — `id: "qa"` в union + `push` при `showQaTab`
  (образец `showReviewsTab`, строки 34-36). Лейбл — `PRODUCT_QA_UI.TAB` + счётчик публичных.
- **`useProductDetailsModalTabs.js`** — `showQaTab`:
  ```js
  const showQaTab =
    product?._id != null &&
    (isSellerView
      ? true // владельцу всегда, чтобы отвечать/управлять
      : product.productQaEnabled === true &&
        product.productModerationStatus === PRODUCT_MODERATION_APPROVED);
  ```
  Добавить в `showProductDetailsTabs` (OR) и в эффект авто-сброса
  (строки 90-122: `if (detailsTab === "qa" && !showQa) setDetailsTab("details")`).
- **`ProductDetailsModalTabPanel.jsx`** — панель для `qa`.
- Union-тип `detailsTab` расширить до `| 'qa'` во всех местах (grep по строке — их несколько).

### 6.2 Тумблер продавца
- **`ProductEditManageSection.jsx`** — `ProductManageToggleRow` для Q&A (образец блока
  `showAuctionToggle`, строки 151-166). Пропы `onSetQa`, `isQaTogglePending`;
  `checked={product.productQaEnabled === true}`.
- Обработчик `onSetQa` в родителе — оптимистичный `PATCH /product/:id { productQaEnabled }`
  (образец `useHomeProductActions.js` / `setProductInstallmentEnabled.js`), откат при ошибке.

### 6.3 Тексты — `client/src/shared/config/appUiCopy.js`
Блок `PRODUCT_QA_UI` (образец `PRODUCT_PRICE_OFFER_UI`, `INSTALLMENT_UI`):
`TAB`, `COUNT_FN(n)` → «Вопросы · N», `ASK_PLACEHOLDER`, `ASK_SUBMIT`, `ANSWER_PLACEHOLDER`,
`ANSWER_SUBMIT`, `PENDING_BADGE` («Ждёт ответа»), `SELLER_ANSWER_LABEL`, `EMPTY_STATE`,
`LIMIT_REACHED`, `LOGIN_TO_ASK`, `HIDE_ACTION`, `DELETE_ACTION`, `SLOTS_FN(n)` → «N/50».
В `CREATE_PRODUCT_MODAL_UI` — `MANAGE_QA_TITLE`, `MANAGE_QA_HINT`, `QA_TOGGLE_PENDING`.

---

## 7. Матрица прав доступа

| Действие                       | Гость | Покупатель | Продавец-владелец | Модератор |
| ------------------------------ | :---: | :--------: | :---------------: | :-------: |
| Смотреть отвеченные (публичные)|  ✅¹  |     ✅¹     |        ✅          |    ✅     |
| Видеть свой `pending`          |   —   |     ✅     |         —          |    —      |
| Видеть чужие `pending`         |  ❌   |     ❌     |        ✅          |    ✅     |
| Задать вопрос                  |  ❌   |     ✅²     |    ❌ (свой товар) |    —      |
| Ответить на вопрос             |  ❌   |     ❌     |        ✅          |   ❌³     |
| Удалить свой вопрос (в окне)   |  ❌   |     ✅     |         —          |    —      |
| Скрыть вопрос (`hidden`)       |  ❌   |     ❌     |        ✅          |    ✅     |

¹ только если `productQaEnabled` и товар одобрен (владельцу — всегда).
² при `canAsk`: авторизован, `remaining > 0`, не свой товар.
³ модератор скрывает, но не отвечает от имени продавца.

---

## 8. Инвариант «≤ 50 вопросов» — атомарно

Наивный `countDocuments()` → `create()` даёт TOCTOU-гонку (два параллельных увидят 49 и
создадут 51-й). Эталон борьбы в репозитории — `stockReserveGuardTick` для оверселла
(`ProductModel.js:225-232`).

**Счётчик-страж + условный `$inc`:**
```js
const claimed = await ProductModel.findOneAndUpdate(
  { _id: productId, productQuestionCount: { $lt: PRODUCT_QUESTIONS_MAX_PER_PRODUCT } },
  { $inc: { productQuestionCount: 1 } },
  { new: true },
);
if (!claimed) throw new AppError(409, PRODUCT_QUESTION_MESSAGES.LIMIT_REACHED);
try {
  await ProductQuestionModel.create({ productId, authorUserId, text, status: "pending" });
} catch (err) {
  await ProductModel.updateOne({ _id: productId }, { $inc: { productQuestionCount: -1 } });
  throw err; // компенсация, если create упал
}
```
Фильтр `{ $lt: 50 }` делает проверку-и-инкремент одной атомарной операцией — 51-й получит
`null` и `LIMIT_REACHED`.

**Декремент** при `hidden` и при удалении активного вопроса:
`$inc: { productQuestionCount: -1 }` (защита от минуса — `min: 0` в схеме + `$max` при апдейте).

> `pending` тоже занимает слот. Поэтому при спаме продавец **скрывает** вопросы (§2 №7) —
> это и есть механизм возврата слотов. Согласованно с низким барьером (§2 №2).

---

## 9. Тесты

Образцы: `server/tests/productCatalogReviewsSort.test.js`, `setProductInstallmentEnabled.test.js`.

**Server:**
- Лимит: 50 успешно, 51-й → `409 LIMIT_REACHED`.
- Гонка: `Promise.all` на границе 49 → ровно один перешагивает.
- Продавец не может спросить свой товар (`OWN_PRODUCT`).
- Только продавец отвечает; ответ на `hidden` → `CANNOT_ANSWER_HIDDEN`.
- Ответ переводит `pending → answered` и делает вопрос публичным.
- `pending` виден автору и продавцу, **не** виден другому покупателю/гостю.
- Скрытие декрементит счётчик и освобождает слот; `hidden` не в публичной ленте и не в лимите.
- Удаление своего вопроса в окне декрементит счётчик; после окна → `DELETE_WINDOW_EXPIRED`.
- Сортировка: отвеченные выше неотвеченных.
- Каскад: удаление товара удаляет его вопросы.

**Client:**
- `useProductDetailsModalTabs` — `showQaTab` по роли/флагу/апруву.
- Форма вопроса скрыта у владельца и при `remaining === 0`.
- Оптимистичный `onSetQa` откатывается при ошибке PATCH.
- Бейдж «Ждёт ответа» на своём `pending`.

---

## 10. Mobile (паритет)

Q&A-таб для mobile — **отдельная задача после стабилизации веба** (память проекта: геометрия
web↔mobile ~98%). Контракт и слой `api/` делаем переиспользуемыми, чтобы mobile не дублировал.

---

## 11. Уведомления

**v1 (решение №4):** новый вопрос → `UserInAppNotification` продавцу («Новый вопрос о товаре …»).
Точка вызова — в `askProductQuestion` (образец существующих нотификаций).

**Post-v1 (TODO):** ответ продавца → нотификация автору вопроса. Точку оставляем `TODO` в
`answerProductQuestion`, выносим в отдельный тикет.

---

## 12. Чек-лист реализации (по файлам)

**Contract**
- [ ] `contract/src/productQuestion.js` — константы (300/300/50) + Zod-схемы
- [ ] `contract/src/index.js` — реэкспорт
- [ ] `contract/src/apiTypes.js` — `@typedef`
- [ ] `contract/src/productFromApi.js` — `productQaEnabled` в сериализации
- [ ] `contract/src/productWrite.js` — `productQaEnabled` в `patchFieldShape`

**Server**
- [ ] `server/constants/productQuestionConstants.js` (3 статуса, лимиты)
- [ ] `server/models/ProductQuestionModel.js` + экспорт в `models/index.js`
- [ ] `server/models/ProductModel.js` — `productQaEnabled` + `productQuestionCount`
- [ ] `server/validations/product/productQuestionValidation.js` + экспорт
- [ ] `server/services/product/productQuestion.js` (+ `productQuestionHelpers.js`)
- [ ] `server/controllers/Product/productQuestionControllers.js` + экспорт
- [ ] `server/middlewares/` — `productQuestionRateLimiter` + экспорт
- [ ] `server/routes/productRouter.js` — 6 маршрутов + импорты
- [ ] каскад удаления в `deleteMyProductController`/сервисе товара
- [ ] нотификация продавцу в `askProductQuestion`
- [ ] `server/tests/` — лимит, гонка, видимость, права, каскад

**Client**
- [ ] `entities/product-qa/` — весь слайс (api/model/lib/ui)
- [ ] `product-details-modal/ProductDetailsModalQaTab.jsx`
- [ ] `ProductDetailsModalTabs.jsx` — вкладка `qa`
- [ ] `useProductDetailsModalTabs.js` — `showQaTab` + авто-сброс
- [ ] `ProductDetailsModalTabPanel.jsx` — панель `qa`
- [ ] `ProductEditManageSection.jsx` — тумблер + `onSetQa`
- [ ] обработчик `onSetQa` (оптимистичный PATCH) в родителе
- [ ] `shared/config/appUiCopy.js` — `PRODUCT_QA_UI` + строки тумблера
- [ ] union-тип `detailsTab` → `| 'qa'` во всех местах

**Проверка**
- [ ] `npm run lint` (`docs/quality/LINT.md`)
- [ ] preview: включить тумблер → задать вопрос (виден только автору) → ответить (стал публичным)
      → скрыть → проверить счётчик и лимит 50

---

## 13. Порядок работ

1. Contract + серверная модель/константы (фундамент типов).
2. Сервис + атомарный лимит (§8) + viewer-aware видимость + контроллеры/роуты.
   Проверить в Insomnia (`server/docs/INSOMNIA_GUIDE.md`).
3. Серверные тесты на лимит/видимость/права — **до** UI.
4. Клиентский слайс `product-qa` (api → model → ui).
5. Таб в модалке + тумблер в управлении.
6. Нотификация продавцу, UI-копирайт, lint, preview-прогон.

---

_Решения зафиксированы в §2. По ходу реализации отмечаем чек-боксы §12._
