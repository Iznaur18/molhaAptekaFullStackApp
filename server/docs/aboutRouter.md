# Как работает Router в нашем проекте

Документ по шагам: от запроса клиента до ответа. Цель — понять цепочку и уметь повторить.

---

## 1. Последовательность работы кода (по шагам)

### Шаг 1. Запуск приложения (`index.js`)

При запуске `node index.js` происходит следующее:

1. Подключается MongoDB (асинхронно).
2. Создаётся объект **app** — это наше приложение Express (одно на весь сервер).
3. Подключаются общие middleware: `express.json()`, `cors()`, раздача папки `uploads`.
4. Выполняется строка:
   ```js
   app.use('/upload', uploadRouter);
   ```
   Здесь **uploadRouter** — это роутер из файла `routes/uploadRouter.js`. Мы «вешаем» его на путь **/upload**. То есть все маршруты этого роутера будут начинаться с `/upload`.
5. Сервер вызывает `app.listen(PORT)` и начинает слушать порт 4444.

**Итог:** приложение знает: «если пришёл запрос на путь, начинающийся с `/upload`, отдай его в uploadRouter».

---

### Шаг 2. Откуда берётся `uploadRouter`?

В `index.js` написано:

```js
import { uploadRouter } from './routes/index.js';
```

- Это **особенность ES-модулей (JavaScript)**: мы импортируем имя из другого файла.
- Файл `routes/index.js` не создаёт маршруты сам, а только реэкспортирует роутер:
  ```js
  import { uploadRouter } from './uploadRouter.js';
  export { uploadRouter };
  ```
- В `routes/uploadRouter.js` создаётся роутер и экспортируется под именем **uploadRouter**:
  ```js
  const router = Router();
  router.post('/', uploadMW.single('image'), uploadController);
  export { router as uploadRouter };
  ```

**Итог:** в `index.js` в переменной `uploadRouter` лежит тот самый объект роутера из `uploadRouter.js`.

---

### Шаг 3. Что происходит, когда клиент шлёт запрос `POST /upload`?

Цепочка такая:

1. Запрос приходит на сервер: метод **POST**, путь **/upload** (без слэша в конце или с ним — Express нормализует).
2. Express смотрит: путь начинается с `/upload` → запрос передаётся в **uploadRouter** (мы это настроили через `app.use('/upload', uploadRouter)`).
3. Внутри uploadRouter путь считается **относительно префикса**. Мы зарегистрировали:
   ```js
   router.post('/', uploadMW.single('image'), uploadController);
   ```
   Путь в роутере — это `'/'`. Вместе с префиксом получается: `/upload` + `'/'` = **/upload**. Поэтому срабатывает именно этот обработчик.
4. Выполняются по порядку:
   - **uploadMW.single('image')** — middleware multer: читает поле `image` из формы, сохраняет файл в `uploads/`, кладёт результат в `req.file`. Потом вызывает `next()`.
   - **uploadController** — функция (req, res): проверяет `req.file`, формирует ответ и отправляет его клиенту через `successRes(res, { ... })`.

**Итог:** запрос прошёл по цепочке app → uploadRouter → multer → uploadController → ответ клиенту.

---

### Шаг 4. Сводная схема потока

```
Клиент:  POST /upload  +  тело с полем "image" (файл)
                │
                ▼
         index.js (app)
                │
                │  app.use('/upload', uploadRouter)
                ▼
         uploadRouter (routes/uploadRouter.js)
                │
                │  router.post('/', uploadMW.single('image'), uploadController)
                ▼
         1) uploadMW.single('image')  →  сохраняет файл, req.file заполнен
                │
                ▼
         2) uploadController(req, res)  →  отправляет JSON с путём к файлу
                │
                ▼
         Клиент получает ответ
```

Запомни: **сначала префикс в app, потом путь в router, потом по очереди middleware и контроллер.**

---

## 2. Закон: префикс + путь в роутере = полный URL

- В **index.js** мы пишем: `app.use('/upload', uploadRouter)`. Здесь **/upload** — это **префикс**.
- В **uploadRouter.js** мы пишем: `router.post('/', ...)`. Здесь **'/'** — это **путь внутри роутера** (относительный).
- **Полный путь** для этого маршрута: префикс + путь = `/upload` + `/` = **/upload**.

Если бы было так:

```js
app.use('/api/upload', uploadRouter);
```

то тот же `router.post('/', ...)` дал бы маршрут **POST /api/upload**.

Если бы в роутере было:

```js
router.post('/image', ...);
```

то при `app.use('/upload', uploadRouter)` получился бы маршрут **POST /upload/image**.

**Это не случайность, а правило Express:** при `app.use(префикс, роутер)` все пути из роутера «приклеиваются» к префиксу.

---

## 3. Зачем вообще Router, а не везде app?

- **app** — один на приложение. Он создаётся в **index.js** и там же к нему подключаются все роуты.
- Если бы мы писали все маршруты в **index.js**, файл раздулся бы и смешал бы подключение БД, настройки и десятки строк с `app.get(...)`, `app.post(...)`.
- **Router** — это «кусок маршрутов». Его можно описать в отдельном файле (например, только загрузка файлов), а в **index.js** одной строкой подключить: `app.use('/upload', uploadRouter)`.

**Правило (архитектура):** в **index.js** только создание app, общие middleware и подключение роутеров по префиксам. Конкретные маршруты живут в файлах внутри **routes/**.

**Особенность Express:** у `app` и у `router` одни и те же методы: `.get()`, `.post()`, `.use()`, и т.д. Роутер ведёт себя как «маленькое приложение», которое потом подключается к основному.

---

## 4. Почему в роутере пишем `router.post('/', ...)`, а не `app.post('/upload', ...)`?

- В файле **uploadRouter.js** у нас **нет переменной app**. Там есть только **router**, созданный через `Router()`.
- Мы настраиваем маршруты **относительно этого роутера**. Путь `'/'` означает «корень этого роутера».
- Кто задаёт префикс **/upload**, решает **index.js**, когда пишет `app.use('/upload', uploadRouter)`. Роутер не знает и не должен знать свой префикс — так проще переносить и переиспользовать роуты (например, поменять префикс на `/api/upload` только в index.js).

**Итог:** в файле роута мы думаем только «какой путь внутри этой группы», полный URL собирается в index.js через префикс.

---

## 5. Примеры для повторения

### Добавить новый маршрут в тот же роутер (upload)

Например, удаление загруженного файла по имени:

```js
// routes/uploadRouter.js
import { Router } from 'express';
import { uploadController } from '../controllers/uploadController.js';

// а внутри uploadController.js, например:
export function uploadController(req, res) {
  // здесь обработка запроса
}


const router = Router();

router.delete('/:filename', uploadController.deleteFile);

export { router as uploadRouter };
```

При `app.use('/upload', uploadRouter)` получится маршрут **DELETE /upload/:filename**.

### Добавить новый роутер (например, авторизация)

1. Создать файл **routes/authRouter.js**:

   ```js
   import { Router } from 'express';
   import { authController } from '../controllers/authController.js';

   const router = Router();
   router.post('/login', authController.login);
   router.post('/register', authController.register);

   export { router as authRouter };
   ```

2. В **routes/index.js** импортировать и реэкспортировать (или подключать сразу в index.js).
3. В **index.js** добавить:

   ```js
   import { authRouter } from './routes/index.js'; // или из authRouter.js
   app.use('/auth', authRouter);
   ```

Получатся маршруты **POST /auth/login** и **POST /auth/register**.

### Цепочка middleware в одном маршруте

Порядок важен: сначала проверка прав, потом действие.

```js
router.get('/profile', checkAuth, profileController.get);
```

Сначала выполнится **checkAuth** (проверка JWT), потом **profileController.get**. Это **особенность Express**: обработчики вызываются по очереди; каждый может вызвать `next()` или отправить ответ и не вызывать `next()`.

---

## 6. Что закон, что особенность

| Что | Тип | Кратко |
|-----|-----|--------|
| Префикс в `app.use(префикс, роутер)` + путь в `router.post(путь, ...)` = полный URL | **Закон Express** | Так устроен Express. |
| В файле роута используется `router`, а не `app` | **Архитектурное решение** | app один раз в index.js; в остальных файлах — роутеры. |
| Один файл — одна «тема» маршрутов (upload, auth, products) | **Соглашение проекта** | Удобно поддерживать. |
| `import` / `export` для роутеров и контроллеров | **Особенность JavaScript (ES-модули)** | Без этого роутер не попадёт в index.js. |
| Обработчики в `router.post(path, mw1, mw2, controller)` вызываются по порядку | **Закон Express** | Сначала mw1, потом mw2, потом controller. |

---

## 7. Краткий чек-лист «как повторить»

1. В **routes/** создать файл, например **somethingRouter.js**.
2. В нём: `const router = Router();`, затем `router.get(...)` / `router.post(...)` с путями **относительно этой группы** (например `'/'`, `'/:id'`).
3. В конце: `export { router as somethingRouter };`.
4. В **index.js**: `import { somethingRouter } from './routes/...';` и `app.use('/префикс', somethingRouter);`.
5. Итоговый URL = **префикс** + **путь в роутере**.

Если запомнишь эту цепочку (app → use(префикс, роутер) → router.post(путь, ...) → middleware → controller), сможешь повторять ту же схему для любых новых групп маршрутов.

// ================= Промпт для технологии

дай описание работы этого Router в новом файле abourRouter.md в папке docs. Я должен понять последовательность работы кода, по шагам от 1 и так далее. Я плохо понимаю как это всё работает. Примеры для новчиков так же помогут. И опиши специфику работы кода, если это закон, то пишешь закон, если особенность язык js то так и пишешь. Главное я должен понять суть работы и уметь в будущем повторить это. А повторить я смогу если пойму. Я хочу понять.