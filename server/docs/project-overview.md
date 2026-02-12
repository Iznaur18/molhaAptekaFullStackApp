# Обзор проекта Molha Apteka

Краткое описание стека, структуры, связей и ключевых решений.

---

## Что это за проект

Backend приложения (API) для аптеки: пользователи, авторизация (email и Telegram), профили, рейтинг по голосам, загрузка файлов. Фронтенд подключается по API; статика и загрузки отдаются с этого же сервера.

---

## Стек технологий

| Технология | Назначение |
|------------|------------|
| **Node.js** | Среда выполнения |
| **Express 5** | HTTP-сервер, маршруты, middleware |
| **MongoDB + Mongoose** | БД и ODM |
| **JWT (jsonwebtoken)** | Авторизация (токен в заголовке `Authorization: Bearer <token>`) |
| **bcrypt** | Хеширование паролей |
| **express-validator** | Валидация тела/параметров запросов |
| **express-rate-limit** | Ограничение частоты запросов (защита от брутфорса и DDoS) |
| **multer** | Загрузка файлов (изображения) |
| **dotenv** | Переменные окружения (.env) |
| **cors** | Доступ с фронтенда (опционально по `FRONTEND_URL`) |

---

## Структура папок

```
server/
├── index.js              # Точка входа: подключение к БД, регистрация роутов, обработчики 404 и ошибок
├── constants/            # Константы (дефолтные URL, списки полей для пользователя/админа)
├── controllers/          # Обработчики запросов (auth, user, vote, upload)
├── middlewares/          # checkAuth (JWT), rate limit, error handler, upload (multer)
├── models/               # Mongoose-модели: User, UserVoteRating
├── routes/               # Роутеры: auth, user, vote, upload
├── utils/                # errorRes, successRes, sendUserWithToken
├── validations/          # Правила express-validator + handleValidationByExpressErrors
└── docs/                 # Документация
```

---

## Как всё связано

1. **Запрос** приходит в `index.js` → CORS, `express.json()`, общий rate limiter, статика `/uploads`, затем роуты.
2. **Роут** (например `/auth`, `/user`, `/vote`, `/upload`) выбирается по префиксу; внутри роутера — цепочка: rate limiter (если есть) → auth (если нужен) → валидация → контроллер.
3. **Валидация** (express-validator) проверяет `body`, `param`, `query`; при ошибках вызывается `handleValidationByExpressErrors` → ответ 400, дальше контроллер не вызывается.
4. **Контроллер** работает с моделями (User, UserVoteRating), вызывает `successRes` / `errorRes` или `sendUserWithToken` для ответа.
5. **Ошибки** из контроллеров и middleware в итоге попадают в централизованный `errorHandler` (Mongoose, JWT, Multer, rate limit, дубликаты ключей и т.д.).
6. **Несуществующий путь** обрабатывается `notFoundHandler` (404) перед `errorHandler`.

Схема потока:

```
Запрос → CORS, json, generalRateLimiter → /uploads | /upload | /auth | /vote | /user
       → notFoundHandler (404) → errorHandler
```

Внутри защищённого роута:

```
rateLimiter (опц.) → checkAuthMW (JWT) → param/body validation → controller
```

---

## Модели и связи

### User (UserModel)

- **Вход:** email + password (хеш в `passwordHash`) или Telegram (`telegramUserId`, опционально `telegramUsername`, `telegramPhotoUrl`).
- **Профиль:** имя, дата рождения, пол, адрес, телефон, аватар, фон, роль (`user`, `admin`, `pharmacist`), скидка, премиум, заметки, активность/блокировка.
- **Рейтинг:** вложенный объект `userRatingByVotes` (countVotes, totalRating) — обновляется при голосовании.
- **Индексы:** email, userName, telegramUserId, userPhoneNumber (sparse/unique где нужно), составные для роли/активности, рейтинга, последнего входа, премиума.

### UserVoteRating (UserVoteRatingModel)

- **Связь с User:** `userVoter` (кто голосует) и `userVoteTarget` (за кого) — ссылки на `User` (ObjectId).
- **Один голос:** один пользователь может оставить только одну оценку за другого (уникальный индекс по паре `userVoter` + `userVoteTarget`).
- **Оценка:** число от 1 до 10 (`userVoteValue`).
- При добавлении/обновлении голоса пересчитывается `userRatingByVotes` у целевого пользователя.
- При удалении пользователя его голоса (как голосующего и как целевого) удаляются каскадно (в контроллере).

---

## API (кратко)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/register` | Регистрация (email, password, опц. userName, phoneNumber, avatarUrl) |
| POST | `/auth/login` | Вход по email + password |
| POST | `/auth/telegram` | Вход/регистрация по Telegram (body: telegramUserId) |
| GET | `/auth/me` | Текущий пользователь (нужен JWT) |
| GET | `/user/:userIdClient` | Публичный профиль по ID |
| PATCH | `/user/:userIdClient` | Обновление профиля (JWT; свои поля или админ — все разрешённые) |
| DELETE | `/user/:userIdClient` | Удаление пользователя (JWT; себя или админ) |
| GET | `/vote/rating/:userIdClient` | Рейтинг пользователя по голосам |
| POST | `/vote/:userVoteTargetIdClient` | Поставить/обновить оценку 1–10 (JWT) |
| POST | `/upload` | Загрузка изображения (JWT, multipart, поле `image`) |

Статика загрузок: `GET /uploads/<filename>`.

---

## Авторизация

- **JWT:** после успешного login/register/telegram клиент получает `token` в ответе; дальше в заголовке: `Authorization: Bearer <token>`.
- **checkAuthMW:** читает токен из заголовка, проверяет через `jwt.verify(JWT_SECRET)`, кладёт `req.userId` (ObjectId). При отсутствии/невалидном токене — 401.
- Срок жизни токена задаётся в `sendUserWithToken` (например 30 дней).

---

## Безопасность и ограничения

- **Rate limit:** общий лимит на все запросы; отдельные лимиты на auth (брутфорс), обновление профиля, голоса, загрузки.
- **Валидация:** только разрешённые поля и форматы (в т.ч. через express-validator); в PATCH профиля — белый список полей (user vs admin) в `constants.js`.
- **Пароли:** только хеш в БД (bcrypt), в ответах не отдаются.
- **Роли:** смена роли и чувствительных полей ограничена логикой в контроллере (админ может больше).

---

## Обработка ошибок

- **errorHandlerMW:** единая точка обработки ошибок (AppError, ValidationError, CastError, JWT, Multer, дубликат ключа, rate limit и т.д.), логирование в консоль, ответ в формате приложения (например через `errorRes`).
- **notFoundHandler:** для неизвестных маршрутов — 404.
- В контроллерах ошибки передаются в next(err) или обрабатываются в catch с вызовом next.

---

## Важные нюансы

- **Два способа входа:** email+пароль и Telegram; у одного пользователя может быть только один из вариантов (email или telegramUserId), поля optional/sparse в схеме.
- **Рейтинг:** хранится и в User (`userRatingByVotes`), и в отдельной коллекции голосов (UserVoteRating) для истории и пересчёта.
- **Загрузки:** файлы сохраняются на диск (multer), раздача через `express.static('uploads')` по пути `/uploads/...`; в профиле хранятся URL (например после загрузки).
- **Валидация:** все правила в папке `validations`, в конце цепочки — `handleValidationByExpressErrors`; опциональные поля и поддержка `null` для очистки описаны в `validation-guide.md`.

---

## Документация в проекте

- `aboutDependencies.md` — зависимости
- `aboutRouter.md` — маршруты
- `userController.md` — пользовательский API
- `validation-guide.md` — как писать валидации
- `improvements.md` — индексы, rate limit, error handler, валидации
- `project-check-report.md` — отчёт о проверке проекта
- `validation-cleanup.md` — удаление дублирующей валидации из контроллеров

---

*Краткий обзор: стек, структура, связи, модели, API, авторизация, безопасность и где искать детали.*
