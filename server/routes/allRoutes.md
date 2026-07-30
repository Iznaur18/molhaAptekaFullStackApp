# API — карта маршрутов

Полный список HTTP-эндпоинтов. Источник истины — монтирование в
[`../createApp.js`](../createApp.js) и файлы [`./`](.). Роутеров: 17.

> Как пересобрать при изменениях: пройтись по `router.stack` каждого роутера
> (метод + `route.path` + имена middleware). Ручной разовый скрипт живёт
> вне репозитория; при желании автоматизировать — вынести в `scripts/`.

## Легенда доступа

| Знак | Middleware | Значение |
| ---- | ---------- | -------- |
| 🔓 | — | Публичный, без токена |
| 🟡 | `checkOptionalAuthMW` | Работает без токена, но учитывает пользователя, если он есть |
| 🔑 | `checkAuthMW` / `checkAuthMeMW` | Нужен JWT (`Authorization: Bearer <token>`) |
| 🛡 | `checkProductModeratorMW` | Только модератор (подразумевает 🔑) |
| 👑 | `checkAdminMW` | Только админ (подразумевает 🔑) |
| ⏱ | `*RateLimiter` | На эндпоинте включён rate limit |

---

## Служебное (top-level, вне роутеров)

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/health` | 🔓 | Health-check (200 `ok` / 503). В prod без `?verbose` отдаёт только статус |
| GET | `/uploads/*` | 🔓 | Статика загрузок (диск, `UPLOAD_STORAGE=disk`). `/uploads/private/*` закрыт (404) |

## Upload — `/upload`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| POST | `/upload` | 🔑 ⏱ | Загрузка файла (multer) |
| POST | `/upload/video` | 🔑 ⏱ | Загрузка видео |
| GET | `/upload/private/:filename` | 🔑 | Приватный файл ПДн (паспорт/селфи) — доступ по проверке владельца/staff |

## Auth — `/auth`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/auth/me` | 🔑 | Текущий пользователь |
| POST | `/auth/register` | ⏱ | Начало регистрации (заявка + код на email, аккаунт ещё не создан) |
| POST | `/auth/register/confirm` | ⏱ | Подтверждение кода → создание аккаунта и вход |
| POST | `/auth/register/resend` | ⏱ | Повторная отправка кода регистрации |
| POST | `/auth/login` | ⏱ | Вход |
| POST | `/auth/logout` | 🔓 | Выход (сброс cookie) |
| POST | `/auth/refresh` | ⏱ | Ротация refresh-токена |
| GET | `/auth/verify-email` | 🔓 | Подтверждение email по токену из письма |
| POST | `/auth/verify-email` | 🔑 | Подтверждение email по коду |
| POST | `/auth/resend-verification` | 🔑 ⏱ | Повторная отправка письма верификации |
| PATCH | `/auth/me/in-app-notifications/read` | 🔑 | Отметить in-app уведомления прочитанными |
| PUT | `/auth/me/push-token` | 🔑 | Регистрация Expo push-токена |
| DELETE | `/auth/me/push-token` | 🔑 | Удаление push-токена |

## User — `/user`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/user/search` | 🔑 ⏱ | Поиск пользователей |
| GET | `/user/:userIdClient` | 🔓 | Публичный профиль |
| PATCH | `/user/:userIdClient` | 🔑 ⏱ | Обновление профиля |
| DELETE | `/user/:userIdClient` | 🔑 | Удаление аккаунта |
| GET | `/user/:userIdClient/products` | 🟡 | Товары пользователя |
| GET | `/user/:userIdClient/purchases` | 🔑 | Покупки пользователя |
| POST | `/user/:userIdClient/follow` | 🔑 ⏱ | Подписаться на пользователя |
| DELETE | `/user/:userIdClient/follow` | 🔑 ⏱ | Отписаться |
| GET | `/user/me/following` | 🔑 | Мои подписки |
| GET | `/user/me/followers` | 🔑 | Мои подписчики |
| **Stories** |
| GET | `/user/stories/feed` | 🟡 | Лента сторис |
| POST | `/user/stories` | 🔑 ⏱ | Создать сторис |
| GET | `/user/stories/author/:userIdClient` | 🟡 | Сторис автора |
| DELETE | `/user/stories/:storyId` | 🔑 | Удалить сторис |
| POST | `/user/stories/:storyId/view` | 🔑 | Отметить просмотр |
| POST | `/user/stories/:storyId/report` | 🔑 ⏱ | Пожаловаться на сторис |
| GET | `/user/stories/reports/pending` | 🛡 | Очередь жалоб на сторис |
| GET | `/user/stories/reports/pending/count` | 🛡 | Счётчик жалоб |
| PATCH | `/user/stories/reports/story/:storyId/resolve` | 🛡 | Решение по жалобе |
| **Подтверждение данных (ПДн)** |
| GET | `/user/me/data-confirmation-request` | 🔑 | Моя заявка на подтверждение данных |
| POST | `/user/me/data-confirmation-request` | 🔑 ⏱ | Подать заявку (паспорт + селфи) |
| GET | `/user/data-confirmation-requests/pending` | 🛡 | Очередь заявок |
| GET | `/user/data-confirmation-requests/pending/count` | 🛡 | Счётчик заявок |
| PATCH | `/user/data-confirmation-requests/:requestId/resolve` | 🛡 | Решение по заявке |
| **Premium / лояльность** |
| GET | `/user/me/premium/status` | 🔑 | Статус premium |
| POST | `/user/me/premium/purchase` | 🔑 | Покупка premium |
| GET | `/user/me/loyalty-points/status` | 🔑 | Баланс баллов лояльности |
| POST | `/user/me/loyalty-points/admin-free-credit` | 👑 | Ручное начисление баллов |
| GET | `/user/loyalty-points/monthly-awarded` | 🔓 | Начисленные за месяц баллы |

## Vote — `/vote`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/vote/rating/:userIdClient` | 🔓 | Рейтинг пользователя |
| GET | `/vote/me/:userVoteTargetIdClient` | 🔑 | Моя оценка цели |
| POST | `/vote/:userVoteTargetIdClient` | 🔑 ⏱ | Поставить оценку |

## Order — `/order`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/order` | 🔑 | Мои заказы |
| GET | `/order/action-count` | 🔑 | Счётчик действий по заказам |
| GET | `/order/sales` | 🔑 | Мои продажи |
| GET | `/order/sales/action-count` | 🔑 | Счётчик действий по продажам |
| GET | `/order/all` | 👑 | Все заказы |
| POST | `/order` | 🔑 ⏱ | Создать заказ |
| PATCH | `/order/:orderId/status` | 👑 | Сменить статус заказа |
| PATCH | `/order/:orderId/items/:itemIndex/shipped` | 🔑 ⏱ | Позиция отправлена |
| PATCH | `/order/:orderId/items/:itemIndex/delivered` | 🔑 ⏱ | Позиция доставлена |
| PATCH | `/order/:orderId/items/:itemIndex/confirm` | 🔑 ⏱ | Покупатель подтвердил получение |
| PATCH | `/order/:orderId/items/:itemIndex/cancelled` | 🔑 ⏱ | Отмена позиции |

## Cart — `/cart`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/cart` | 🔑 | Моя корзина |
| PUT | `/cart` | 🔑 ⏱ | Заменить корзину целиком |

## Favorites — `/favorites`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/favorites` | 🔑 | Избранное |
| PUT | `/favorites` | 🔑 ⏱ | Заменить избранное целиком |

## Product — `/product`

Крупнейший роутер. Внутри — товары, категории, каталог, розыгрыши,
продвижение, модерация, отзывы, жалобы, рассрочка и торг за цену.

### Товары и каталог

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/product` | 🟡 | Каталог (пагинация `?page=&limit=`, фильтры, поиск) |
| POST | `/product` | 🔑 | Создать товар |
| GET | `/product/my` | 🔑 | Мои товары |
| GET | `/product/:productId/catalog` | 🟡 | Карточка товара для каталога |
| GET | `/product/:productId/compare` | 🔓 | Товары для блока «Сравнение» в деталях |
| PATCH | `/product/:productId` | 🔑 | Обновить товар |
| DELETE | `/product/:productId` | 🔑 | Удалить товар |
| POST | `/product/:productId/view` | 🔑 | Засчитать просмотр |

### Категории и витрины

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/product/categories/roots` | 🔓 | Корневые категории |
| GET | `/product/categories/search` | 🔓 | Поиск по категориям |
| GET | `/product/categories/:categoryId/children` | 🔓 | Дочерние категории |
| GET | `/product/categories/:categoryId/breadcrumb` | 🔓 | Хлебные крошки |
| GET | `/product/category-displays` | 🔓 | Настройки отображения категорий |
| PATCH | `/product/category-displays/:categorySlug` | 👑 | Правка отображения категории |
| PATCH | `/product/category-node-displays/:categoryId` | 👑 | Правка отображения узла категории |
| GET | `/product/catalog-feed-displays` | 🔓 | Плитки ленты каталога |
| PATCH | `/product/catalog-feed-displays/:tileKey` | 👑 | Правка плитки ленты |
| GET | `/product/manage-toggle-displays` | 🔓 | Тумблеры управления товаром |
| PATCH | `/product/manage-toggle-displays/:toggleKey` | 🛡 | Правка тумблера |
| GET | `/product/curated-lists/home` | 🟡 | Подборки на главной |

### Admin — синонимы поиска, подборки, дерево категорий

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/product/admin/search-synonyms` | 👑 | Список синонимов |
| POST | `/product/admin/search-synonyms` | 👑 | Добавить синоним |
| PATCH | `/product/admin/search-synonyms/:synonymId` | 👑 | Правка синонима |
| DELETE | `/product/admin/search-synonyms/:synonymId` | 👑 | Удалить синоним |
| GET | `/product/admin/curated-lists` | 👑 | Список подборок |
| POST | `/product/admin/curated-lists` | 👑 | Создать подборку |
| PATCH | `/product/admin/curated-lists/reorder` | 👑 | Переупорядочить подборки |
| PATCH | `/product/admin/curated-lists/:listId` | 👑 | Правка подборки |
| DELETE | `/product/admin/curated-lists/:listId` | 👑 | Удалить подборку |
| POST | `/product/admin/curated-lists/:listId/products` | 👑 | Добавить товар в подборку |
| DELETE | `/product/admin/curated-lists/:listId/products/:productId` | 👑 | Убрать товар из подборки |
| GET | `/product/admin/categories` | 👑 | Дерево категорий |
| POST | `/product/admin/categories` | 👑 | Создать категорию |
| PATCH | `/product/admin/categories/:categoryId` | 👑 | Правка категории |
| DELETE | `/product/admin/categories/:categoryId` | 👑 | Удалить категорию |

### Модерация товаров и жалобы

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/product/moderation/pending` | 🛡 | Очередь модерации |
| GET | `/product/moderation/pending/count` | 🛡 | Счётчик очереди |
| PATCH | `/product/:productId/moderation/approve` | 🛡 | Одобрить товар |
| PATCH | `/product/:productId/moderation/reject` | 🛡 | Отклонить товар |
| GET | `/product/reports/pending` | 🛡 | Очередь жалоб на товары |
| GET | `/product/reports/pending/count` | 🛡 | Счётчик жалоб |
| PATCH | `/product/reports/product/:productId/resolve` | 🛡 | Решение по жалобе |
| GET | `/product/:productId/report/me` | 🔑 | Моя жалоба на товар |
| POST | `/product/:productId/report` | 🔑 ⏱ | Пожаловаться на товар |

### Отзывы

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/product/:productId/reviews` | 🔓 | Список отзывов |
| GET | `/product/:productId/reviews/summary` | 🟡 | Сводка по отзывам |
| POST | `/product/:productId/reviews` | 🔑 ⏱ | Оставить отзыв |
| PATCH | `/product/:productId/reviews/me` | 🔑 ⏱ | Изменить свой отзыв |
| DELETE | `/product/:productId/reviews/me` | 🔑 | Удалить свой отзыв |

### Розыгрыши (raffles)

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/product/raffles/featured` | 🔓 | Активный розыгрыш |
| GET | `/product/raffles/my` | 🔑 | Мой розыгрыш |
| GET | `/product/raffles/create-advertising` | 🔑 | Реклама создания розыгрыша |
| POST | `/product/raffles/unlock-create` | 🔑 | Разблокировать создание |
| POST | `/product/raffles/cancel-create` | 🔑 | Отменить создание |
| POST | `/product/raffles` | 🔑 | Создать розыгрыш |
| GET | `/product/raffles/:raffleId` | 🔓 | Розыгрыш по id |
| GET | `/product/raffles/:raffleId/products` | 🔓 | Товары розыгрыша |
| PATCH | `/product/raffles/:raffleId` | 🔑 | Правка розыгрыша |
| DELETE | `/product/raffles/my/:raffleId` | 🔑 | Удалить свой розыгрыш |
| PATCH | `/product/raffles/:raffleId/pause` | 🔑 | Пауза розыгрыша |
| PATCH | `/product/:productId/raffle-participation` | 🔑 | Участие товара в розыгрыше |
| GET | `/product/raffles/pending` | 🛡 | Очередь модерации розыгрышей |
| GET | `/product/raffles/pending/count` | 🛡 | Счётчик очереди |
| PATCH | `/product/raffles/:raffleId/staff` | 🛡 | Staff-правка розыгрыша |
| PATCH | `/product/raffles/:raffleId/approve` | 🛡 | Одобрить розыгрыш |
| PATCH | `/product/raffles/:raffleId/reject` | 🛡 | Отклонить розыгрыш |
| DELETE | `/product/raffles/:raffleId` | 🛡 | Удалить розыгрыш (staff) |

### Продвижение (promotions)

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/product/promotions/tariffs` | 🔓 | Тарифы продвижения |
| GET | `/product/promotions/my` | 🔑 | Мои заявки на продвижение |
| POST | `/product/:productId/promotions/request` | 🔑 | Заявка на продвижение |
| GET | `/product/promotions/pending` | 🛡 | Очередь модерации |
| GET | `/product/promotions/pending/count` | 🛡 | Счётчик очереди |
| PATCH | `/product/promotions/:promotionId/approve` | 🛡 | Одобрить |
| PATCH | `/product/promotions/:promotionId/reject` | 🛡 | Отклонить |

### Рассрочка (программа на товаре)

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/product/:productId/installment-program` | 🟡 | Программа рассрочки товара |
| PUT | `/product/:productId/installment-program` | 🔑 | Настроить программу (продавец) |
| POST | `/product/:productId/installment-contracts` | 🔑 | Оформить договор рассрочки |

### Торг за цену (price offers)

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/product/:productId/price-offers/top` | 🔓 | Топ предложений |
| GET | `/product/:productId/price-offers` | 🔑 | Предложения по товару |
| GET | `/product/:productId/price-offers/me` | 🔑 | Моё предложение |
| GET | `/product/:productId/price-offers/archive` | 🔑 | Архив предложений |
| POST | `/product/:productId/price-offers` | 🔑 ⏱ | Сделать предложение |
| PATCH | `/product/:productId/price-offers/me` | 🔑 ⏱ | Изменить своё предложение |
| DELETE | `/product/:productId/price-offers/me` | 🔑 | Отозвать предложение |
| PATCH | `/product/:productId/price-offers/:offerId/accept` | 🔑 | Принять предложение (продавец) |
| PATCH | `/product/:productId/price-offers/:offerId/reject` | 🔑 | Отклонить предложение |

## Price offers (агрегатор) — `/price-offers`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/price-offers/my-bids` | 🔑 | Мои ставки по всем товарам |
| GET | `/price-offers/incoming` | 🔑 | Входящие предложения (продавцу) |
| GET | `/price-offers/incoming/pending-count` | 🔑 | Счётчик входящих |

## Address — `/address`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| POST | `/address/suggest` | 🔑 ⏱ | Подсказки адреса (DaData) |

## Installment (договоры) — `/installment`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/installment/contracts/my` | 🔑 | Мои договоры (покупатель) |
| GET | `/installment/contracts/my/action-count` | 🔑 | Счётчик действий |
| GET | `/installment/contracts/sales` | 🔑 | Договоры-продажи (продавец) |
| GET | `/installment/contracts/sales/action-count` | 🔑 | Счётчик действий |
| PATCH | `/installment/contracts/:contractId/payments/:paymentIndex/mark-paid` | 🔑 | Отметить платёж оплаченным |
| PATCH | `/installment/contracts/:contractId/payments/:paymentIndex/confirm` | 🔑 | Подтвердить платёж (продавец) |
| PATCH | `/installment/contracts/:contractId/payments/:paymentIndex/reject` | 🔑 | Отклонить платёж |
| PATCH | `/installment/contracts/:contractId/pay-early` | 🔑 | Досрочное погашение |
| PATCH | `/installment/contracts/:contractId/pay-early/cancel` | 🔑 | Отменить досрочное |
| PATCH | `/installment/contracts/:contractId/pay-early/confirm` | 🔑 | Подтвердить досрочное |
| PATCH | `/installment/contracts/:contractId/pay-early/reject` | 🔑 | Отклонить досрочное |
| PATCH | `/installment/contracts/:contractId/cancel` | 🔑 | Отменить договор |
| POST | `/installment/contracts/:contractId/message` | 🔑 | Сообщение по договору |
| POST | `/installment/contracts/:contractId/dispute` | 🔑 | Открыть спор |
| GET | `/installment/disputes/pending` | 🛡 | Очередь споров |
| GET | `/installment/disputes/pending/count` | 🛡 | Счётчик споров |
| PATCH | `/installment/disputes/:disputeId/resolve` | 🛡 | Решение по спору |

## App intro — `/app-intro`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/app-intro` | 🔓 | Настройки интро-экрана |
| PATCH | `/app-intro` | 👑 | Правка интро |

## Users loyalty raffle — `/users-loyalty-raffle`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/users-loyalty-raffle` | 🔓 | Настройки лояльности-розыгрыша |
| PATCH | `/users-loyalty-raffle` | 👑 | Правка настроек |

## Site header banner — `/site-header-banner`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/site-header-banner` | 🔓 | Слайды баннера шапки |
| GET | `/site-header-banner/settings` | 🛡 | Настройки баннера |
| PATCH | `/site-header-banner/settings` | 🛡 | Правка настроек |

## Site header banner campaign — `/site-header-banner-campaign`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/site-header-banner-campaign/config` | 🔓 | Конфиг кампаний баннера |
| GET | `/site-header-banner-campaign/me` | 🔑 | Моя кампания |
| POST | `/site-header-banner-campaign` | 🔑 | Создать кампанию |
| DELETE | `/site-header-banner-campaign/:campaignId` | 🔑 | Удалить кампанию |
| GET | `/site-header-banner-campaign/moderation/pending` | 🛡 | Очередь модерации |
| GET | `/site-header-banner-campaign/moderation/pending/count` | 🛡 | Счётчик очереди |
| GET | `/site-header-banner-campaign/moderation/managed` | 🛡 | Управляемые кампании |
| POST | `/site-header-banner-campaign/moderation/:campaignId/approve` | 🛡 | Одобрить |
| POST | `/site-header-banner-campaign/moderation/:campaignId/reject` | 🛡 | Отклонить |
| DELETE | `/site-header-banner-campaign/moderation/:campaignId` | 🛡 | Удалить (staff) |

## Intro ad — `/intro-ad`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/intro-ad/config` | 🔓 | Конфиг интро-рекламы |
| GET | `/intro-ad/me` | 🔑 | Моя кампания |
| POST | `/intro-ad` | 🔑 | Создать кампанию |
| DELETE | `/intro-ad/:campaignId` | 🔑 | Удалить кампанию |
| GET | `/intro-ad/moderation/pending` | 🛡 | Очередь модерации |
| GET | `/intro-ad/moderation/pending/count` | 🛡 | Счётчик очереди |
| GET | `/intro-ad/moderation/managed` | 🛡 | Управляемые кампании |
| POST | `/intro-ad/moderation/:campaignId/approve` | 🛡 | Одобрить |
| POST | `/intro-ad/moderation/:campaignId/reject` | 🛡 | Отклонить |
| DELETE | `/intro-ad/moderation/:campaignId` | 🛡 | Удалить (staff) |

## Seller personal category — `/seller-personal-category`

| Метод | Путь | Доступ | Назначение |
| ----- | ---- | ------ | ---------- |
| GET | `/seller-personal-category/config` | 🔓 | Конфиг персональных категорий продавца |
| GET | `/seller-personal-category/catalog-tiles` | 🔓 | Плитки каталога |
| GET | `/seller-personal-category/me` | 🔑 | Моя кампания |
| POST | `/seller-personal-category` | 🔑 | Создать кампанию |
| DELETE | `/seller-personal-category/:campaignId` | 🔑 | Удалить кампанию |
| GET | `/seller-personal-category/moderation/pending` | 🛡 | Очередь модерации |
| GET | `/seller-personal-category/moderation/pending/count` | 🛡 | Счётчик очереди |
| GET | `/seller-personal-category/moderation/managed` | 🛡 | Управляемые кампании |
| POST | `/seller-personal-category/moderation/:campaignId/approve` | 🛡 | Одобрить |
| POST | `/seller-personal-category/moderation/:campaignId/reject` | 🛡 | Отклонить |
| POST | `/seller-personal-category/moderation/:campaignId/cancel` | 🛡 | Отменить |
| DELETE | `/seller-personal-category/moderation/:campaignId/staff` | 🛡 | Удалить (staff) |
