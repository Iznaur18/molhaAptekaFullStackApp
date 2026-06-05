# Руководство по созданию файлов валидации

Полное руководство по созданию и использованию валидаций в проекте.

---

## 📋 Содержание

1. [Структура файла валидации](#структура-файла-валидации)
2. [Типы валидаций](#типы-валидаций)
3. [Обязательные и опциональные поля](#обязательные-и-опциональные-поля)
4. [Обработка null значений](#обработка-null-значений)
5. [Кастомные валидации](#кастомные-валидации)
6. [Встроенные валидаторы express-validator](#встроенные-валидаторы-express-validator)
7. [Интеграция с роутами](#интеграция-с-роутами)
8. [Примеры для разных случаев](#примеры-для-разных-случаев)
9. [Лучшие практики](#лучшие-практики)
10. [Частые ошибки и решения](#частые-ошибки-и-решения)

---

## 📁 Структура файла валидации

### Базовая структура

```javascript
import { body, param, query } from "express-validator";
import { handleValidationByExpressErrors } from "./handleValidationByExpressErrors.js";

/**
 * Описание валидации
 */
export const myValidation = [
  // Валидации полей
  body("fieldName").notEmpty().withMessage("Сообщение об ошибке"),

  // ОБЯЗАТЕЛЬНО в конце!
  handleValidationByExpressErrors,
];
```

### Важные правила:

1. ✅ **Всегда импортируйте** `handleValidationByExpressErrors`
2. ✅ **Всегда добавляйте** `handleValidationByExpressErrors` в конец массива
3. ✅ **Экспортируйте** валидацию как именованный экспорт
4. ✅ **Добавляйте комментарии** для описания назначения валидации

---

## 🎯 Типы валидаций

### 1. `body()` - Валидация тела запроса (POST, PATCH, PUT)

```javascript
import { body } from "express-validator";

export const createUserValidation = [
  body("email").isEmail().withMessage("Неверный email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Пароль должен быть не менее 6 символов"),

  handleValidationByExpressErrors,
];
```

**Использование:** Для валидации данных в `req.body`

---

### 2. `param()` - Валидация параметров URL

```javascript
import { param } from "express-validator";

export const userIdParamValidation = [
  param("userIdClient")
    .notEmpty()
    .withMessage("ID пользователя обязателен")
    .isMongoId()
    .withMessage("Неверный формат ID пользователя"),

  handleValidationByExpressErrors,
];
```

**Использование:** Для валидации параметров из URL (`/user/:userIdClient`)

**Важно:** Имя параметра должно совпадать с именем в роуте!

---

### 3. `query()` - Валидация query параметров

```javascript
import { query } from "express-validator";

export const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Страница должна быть числом от 1"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Лимит должен быть числом от 1 до 100"),

  handleValidationByExpressErrors,
];
```

**Использование:** Для валидации query параметров (`?page=1&limit=10`)

---

## ✅ Обязательные и опциональные поля

### Обязательное поле

```javascript
body("email")
  .notEmpty() // Поле не должно быть пустым
  .withMessage("Email обязателен")
  .isEmail() // Дополнительная валидация
  .withMessage("Неверный формат email");
```

**Поведение:**

- Если поле отсутствует → ошибка
- Если поле пустое (`""`, `null`, `undefined`) → ошибка
- Если поле невалидно → ошибка

---

### Опциональное поле (без null)

```javascript
body("userName")
  .optional() // Поле опционально
  .isLength({ min: 3 }) // Валидация только если поле передано
  .withMessage("Ник должен быть не менее 3 символов")
  .trim();
```

**Поведение:**

- Если поле отсутствует → валидация пропускается ✅
- Если поле передано → выполняется валидация
- Если поле `null` или `""` → ошибка ❌

---

### Опциональное поле (с поддержкой null)

```javascript
body("userPhoneNumber")
  .optional({ nullable: true }) // Поле опционально, null разрешен
  .isMobilePhone()
  .withMessage("Неверный номер телефона");
```

**Поведение:**

- Если поле отсутствует → валидация пропускается ✅
- Если поле `null` → валидация пропускается ✅
- Если поле передано → выполняется валидация

---

### Опциональное поле (с поддержкой null и пустых строк)

```javascript
body("userAvatarUrl")
  .optional({ nullable: true, checkFalsy: true }) // null и пустые строки разрешены
  .isURL()
  .withMessage("URL должен быть валидным");
```

**Поведение:**

- Если поле отсутствует → валидация пропускается ✅
- Если поле `null` → валидация пропускается ✅
- Если поле `""` (пустая строка) → валидация пропускается ✅
- Если поле передано → выполняется валидация

**Когда использовать:**

- Для полей, которые можно очистить (установить в null или пустую строку)
- Для опциональных URL полей
- Для опциональных строковых полей

---

## 🔧 Обработка null значений

### Проблема с `.optional()`

По умолчанию `.optional()` **НЕ** пропускает `null` значения:

```javascript
// ❌ НЕПРАВИЛЬНО - null вызовет ошибку
body("userName")
  .optional()
  .isLength({ min: 3 })
  .withMessage("Ник должен быть не менее 3 символов");
```

**Если передать `{ userName: null }`** → ошибка валидации ❌

---

### Решение: `.optional({ nullable: true })`

```javascript
// ✅ ПРАВИЛЬНО - null разрешен
body("userName")
  .optional({ nullable: true })
  .isLength({ min: 3 })
  .withMessage("Ник должен быть не менее 3 символов");
```

**Если передать `{ userName: null }`** → валидация пропускается ✅

---

### Решение: Кастомная валидация с проверкой null

```javascript
body("userName")
  .optional({ nullable: true, checkFalsy: true })
  .custom((value) => {
    // Если null или пустая строка - разрешаем (для очистки поля)
    if (value === null || value === "") {
      return true;
    }
    // Иначе валидируем
    if (typeof value !== "string" || value.trim().length < 3) {
      throw new Error("Имя пользователя должно быть строкой не менее 3 символов");
    }
    return true;
  })
  .trim();
```

**Преимущества:**

- Полный контроль над валидацией
- Можно разрешить null для очистки поля
- Можно добавить сложную логику

---

## 🎨 Кастомные валидации

### Базовый синтаксис

```javascript
body('fieldName')
    .custom((value) => {
        // value - значение поля
        // Если валидация не прошла - выбрасываем ошибку
        if (/* условие ошибки */) {
            throw new Error('Сообщение об ошибке');
        }
        // Если валидация прошла - возвращаем true
        return true;
    });
```

---

### Пример 1: Валидация даты с проверкой диапазона

```javascript
body("userBirthDate")
  .optional({ nullable: true, checkFalsy: true })
  .custom((value) => {
    if (value === null || value === "") {
      return true; // Разрешаем null для очистки
    }

    const date = new Date(value);

    // Проверка формата даты
    if (isNaN(date.getTime())) {
      throw new Error("Дата должна быть в формате ISO 8601");
    }

    // Проверка диапазона (не в будущем)
    if (date > new Date()) {
      throw new Error("Дата рождения не может быть в будущем");
    }

    // Проверка минимального возраста (например, 18 лет)
    const minAge = new Date();
    minAge.setFullYear(minAge.getFullYear() - 18);
    if (date > minAge) {
      throw new Error("Пользователь должен быть старше 18 лет");
    }

    return true;
  });
```

---

### Пример 2: Валидация URL с проверкой домена

```javascript
body("userAvatarUrl")
  .optional({ nullable: true, checkFalsy: true })
  .custom((value) => {
    if (value === null || value === "") {
      return true; // Разрешаем null для очистки
    }

    try {
      const url = new URL(value);

      // Проверка формата URL
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("URL должен использовать протокол http или https");
      }

      // Проверка домена (например, только разрешенные домены)
      const allowedDomains = ["example.com", "cdn.example.com"];
      if (!allowedDomains.includes(url.hostname)) {
        throw new Error("URL должен быть с разрешенного домена");
      }

      return true;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("URL должен быть валидным");
      }
      throw error;
    }
  });
```

---

### Пример 3: Валидация с зависимостью от другого поля

```javascript
body("confirmPassword").custom((value, { req }) => {
  // req.body содержит все поля запроса
  if (value !== req.body.password) {
    throw new Error("Пароли не совпадают");
  }
  return true;
});
```

**Важно:** Второй параметр `{ req }` дает доступ к объекту запроса!

---

### Пример 4: Валидация массива

```javascript
body("tags")
  .optional({ nullable: true })
  .isArray()
  .withMessage("Теги должны быть массивом")
  .custom((value) => {
    if (value.length > 10) {
      throw new Error("Максимум 10 тегов");
    }

    // Проверка каждого элемента массива
    for (const tag of value) {
      if (typeof tag !== "string" || tag.length < 2) {
        throw new Error("Каждый тег должен быть строкой не менее 2 символов");
      }
    }

    return true;
  });
```

---

## 📚 Встроенные валидаторы express-validator

### Строки

```javascript
body("userName")
  .notEmpty() // Не пустое
  .isLength({ min: 3, max: 20 }) // Длина от 3 до 20
  .trim() // Убрать пробелы в начале/конце
  .matches(/^[a-zA-Z0-9_]+$/) // Регулярное выражение
  .withMessage("Только буквы, цифры и подчеркивание");
```

---

### Числа

```javascript
body("age")
  .isInt({ min: 0, max: 120 }) // Целое число от 0 до 120
  .withMessage("Возраст должен быть числом от 0 до 120");

body("price")
  .isFloat({ min: 0 }) // Дробное число от 0
  .withMessage("Цена должна быть положительным числом");
```

---

### Email и URL

```javascript
body("email")
  .isEmail() // Валидный email
  .withMessage("Неверный формат email");

body("website")
  .isURL() // Валидный URL
  .withMessage("Неверный формат URL");
```

---

### Даты

```javascript
body("birthDate")
  .isISO8601() // ISO 8601 формат (2024-01-15T10:30:00.000Z)
  .withMessage("Дата должна быть в формате ISO 8601");

body("date")
  .isDate() // Любой формат даты
  .withMessage("Неверный формат даты");
```

---

### Булевы значения

```javascript
body("isActive")
  .isBoolean() // true или false
  .withMessage("Значение должно быть булевым (true/false)");
```

**Важно:** `"true"` и `"false"` (строки) НЕ пройдут валидацию! Нужно передавать `true` или `false` (boolean).

---

### MongoDB ObjectId

```javascript
param("userId")
  .isMongoId() // Валидный MongoDB ObjectId
  .withMessage("Неверный формат ID");
```

---

### Телефоны

```javascript
body("phone")
  .isMobilePhone("any", { strictMode: false }) // Любой формат телефона
  .withMessage("Неверный формат номера телефона");

body("phone")
  .isMobilePhone("ru-RU") // Только российские номера
  .withMessage("Неверный формат российского номера");
```

---

### Enum значения

```javascript
body("userRole")
  .isIn(["user", "admin", "pharmacist"]) // Одно из значений
  .withMessage("Роль должна быть одной из: user, admin, pharmacist");
```

---

## 🔗 Интеграция с роутами

### Базовый пример

```javascript
// routes/userRouter.js
import { Router } from "express";
import {
  userIdParamValidation,
  updateProfileValidation,
} from "../validations/index.js";
import { userUpdateProfileController } from "../controllers/index.js";

const router = Router();

router.patch(
  "/:userIdClient",
  userIdParamValidation, // 1. Валидация параметра URL
  updateProfileValidation, // 2. Валидация тела запроса
  userUpdateProfileController, // 3. Контроллер
);

export { router as userRouter };
```

---

### Порядок middleware важен!

**Правильный порядок:**

```javascript
router.METHOD(
  "/path",
  rateLimiter, // 1. Rate limiting (защита)
  checkAuthMW, // 2. Авторизация (если требуется)
  paramValidation, // 3. Валидация параметров URL
  queryValidation, // 4. Валидация query параметров (если есть)
  bodyValidation, // 5. Валидация тела запроса
  controller, // 6. Контроллер (бизнес-логика)
);
```

**Неправильный порядок:**

```javascript
// ❌ НЕПРАВИЛЬНО - валидация после контроллера не сработает!
router.patch("/:userId", controller, bodyValidation);
```

---

### Экспорт валидаций

**1. В файле валидации:**

```javascript
// validations/myValidation.js
export const myValidation = [
  /* ... */
];
export const myParamValidation = [
  /* ... */
];
```

**2. В index.js валидаций:**

```javascript
// validations/index.js
import { myValidation, myParamValidation } from "./myValidation.js";

export { myValidation, myParamValidation };
```

**3. Использование в роуте:**

```javascript
import { myValidation } from "../validations/index.js";
```

---

## 📝 Примеры для разных случаев

### Пример 1: Простая регистрация

```javascript
// validations/registerValidation.js
import { body } from "express-validator";
import { handleValidationByExpressErrors } from "./handleValidationByExpressErrors.js";

export const registerValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email обязателен")
    .isEmail()
    .withMessage("Неверный формат email"),

  body("password")
    .notEmpty()
    .withMessage("Пароль обязателен")
    .isLength({ min: 6 })
    .withMessage("Пароль должен быть не менее 6 символов"),

  body("userName")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Ник должен быть не менее 3 символов")
    .trim(),

  handleValidationByExpressErrors,
];
```

---

### Пример 2: Обновление с поддержкой null

```javascript
// validations/updateProductValidation.js
import { body, param } from "express-validator";
import { handleValidationByExpressErrors } from "./handleValidationByExpressErrors.js";

export const productIdParamValidation = [
  param("productId")
    .notEmpty()
    .withMessage("ID продукта обязателен")
    .isMongoId()
    .withMessage("Неверный формат ID продукта"),
  handleValidationByExpressErrors,
];

export const updateProductValidation = [
  body("name")
    .optional({ nullable: true })
    .isLength({ min: 3, max: 100 })
    .withMessage("Название должно быть от 3 до 100 символов")
    .trim(),

  body("price")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Цена должна быть положительным числом"),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === null || value === "") {
        return true; // Разрешаем очистку
      }
      if (typeof value !== "string" || value.length > 1000) {
        throw new Error("Описание должно быть строкой не более 1000 символов");
      }
      return true;
    })
    .trim(),

  body("isActive")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("isActive должен быть булевым значением"),

  handleValidationByExpressErrors,
];
```

---

### Пример 3: Сложная валидация с зависимостями

```javascript
// validations/createOrderValidation.js
import { body } from "express-validator";
import { handleValidationByExpressErrors } from "./handleValidationByExpressErrors.js";

export const createOrderValidation = [
  body("items")
    .notEmpty()
    .withMessage("Список товаров обязателен")
    .isArray({ min: 1 })
    .withMessage("Должен быть хотя бы один товар")
    .custom((items) => {
      for (const item of items) {
        if (!item.productId) {
          throw new Error("Каждый товар должен иметь productId");
        }
        if (!item.quantity || item.quantity < 1) {
          throw new Error("Количество должно быть больше 0");
        }
      }
      return true;
    }),

  body("deliveryAddress")
    .notEmpty()
    .withMessage("Адрес доставки обязателен")
    .isLength({ min: 10 })
    .withMessage("Адрес должен быть не менее 10 символов")
    .trim(),

  body("paymentMethod")
    .isIn(["card", "cash", "online"])
    .withMessage("Метод оплаты должен быть одним из: card, cash, online"),

  body("deliveryDate")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Неверный формат даты доставки");
      }
      if (date < new Date()) {
        throw new Error("Дата доставки не может быть в прошлом");
      }
      return true;
    }),

  handleValidationByExpressErrors,
];
```

---

### Пример 4: Валидация query параметров

```javascript
// validations/paginationValidation.js
import { query } from "express-validator";
import { handleValidationByExpressErrors } from "./handleValidationByExpressErrors.js";

export const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Страница должна быть числом от 1")
    .toInt(), // Конвертация в число

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Лимит должен быть числом от 1 до 100")
    .toInt(), // Конвертация в число

  query("sortBy")
    .optional()
    .isIn(["createdAt", "price", "name"])
    .withMessage("Сортировка должна быть по: createdAt, price, name"),

  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Порядок должен быть: asc или desc"),

  handleValidationByExpressErrors,
];
```

---

## ✅ Лучшие практики

### 1. Всегда добавляйте `.withMessage()`

```javascript
// ✅ ПРАВИЛЬНО
body("email").isEmail().withMessage("Неверный формат email");

// ❌ НЕПРАВИЛЬНО - сообщение будет техническим
body("email").isEmail();
```

---

### 2. Используйте `.trim()` для строковых полей

```javascript
// ✅ ПРАВИЛЬНО
body("userName")
  .trim() // Убирает пробелы в начале и конце
  .isLength({ min: 3 });

// ❌ НЕПРАВИЛЬНО - пробелы останутся
body("userName").isLength({ min: 3 });
```

**Важно:** `.trim()` должен быть **ПОСЛЕ** валидации длины, если вы хотите валидировать до trim!

---

### 3. Группируйте связанные валидации

```javascript
// ✅ ПРАВИЛЬНО - одна валидация для одного endpoint
export const updateProfileValidation = [
    body('userName')...,
    body('email')...,
    body('phone')...,
    handleValidationByExpressErrors
];

// ❌ НЕПРАВИЛЬНО - смешивание разных endpoint
export const mixedValidation = [
    body('userName')...,  // для update
    body('password')...,  // для register
    handleValidationByExpressErrors
];
```

---

### 4. Используйте кастомные валидации для сложной логики

```javascript
// ✅ ПРАВИЛЬНО - сложная логика в кастомной валидации
body("birthDate").custom((value) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error("Неверный формат даты");
  }
  if (date > new Date()) {
    throw new Error("Дата не может быть в будущем");
  }
  // Дополнительные проверки...
  return true;
});

// ❌ НЕПРАВИЛЬНО - сложная логика в контроллере
// (валидация должна быть в middleware!)
```

---

### 5. Проверяйте типы в кастомных валидациях

```javascript
// ✅ ПРАВИЛЬНО
body("userName").custom((value) => {
  if (typeof value !== "string") {
    throw new Error("Имя должно быть строкой");
  }
  if (value.trim().length < 3) {
    throw new Error("Имя должно быть не менее 3 символов");
  }
  return true;
});

// ❌ НЕПРАВИЛЬНО - может упасть, если value не строка
body("userName").custom((value) => {
  if (value.trim().length < 3) {
    // Ошибка, если value не строка!
    throw new Error("Имя должно быть не менее 3 символов");
  }
  return true;
});
```

---

### 6. Используйте `.toInt()` и `.toFloat()` для чисел

```javascript
// ✅ ПРАВИЛЬНО - конвертация в число
query("page").isInt({ min: 1 }).toInt(); // Конвертирует строку "1" в число 1

// ❌ НЕПРАВИЛЬНО - останется строкой
query("page").isInt({ min: 1 }); // "1" останется строкой
```

---

## ⚠️ Частые ошибки и решения

### Ошибка 1: Забыли добавить `handleValidationByExpressErrors`

```javascript
// ❌ НЕПРАВИЛЬНО
export const myValidation = [
  body("email").isEmail(),
  // Нет handleValidationByExpressErrors!
];

// ✅ ПРАВИЛЬНО
export const myValidation = [
  body("email").isEmail(),
  handleValidationByExpressErrors, // ОБЯЗАТЕЛЬНО!
];
```

**Результат:** Ошибки валидации не будут обработаны, запрос пройдет дальше с невалидными данными!

---

### Ошибка 2: Неправильный порядок валидаторов

```javascript
// ❌ НЕПРАВИЛЬНО - trim() до проверки длины
body("userName").trim().isLength({ min: 3 }); // Проверяет длину ДО trim!

// ✅ ПРАВИЛЬНО - сначала валидация, потом trim
body("userName").isLength({ min: 3 }).trim(); // Trim применяется после валидации
```

---

### Ошибка 3: `.optional()` не пропускает null

```javascript
// ❌ НЕПРАВИЛЬНО - null вызовет ошибку
body("userName").optional().isLength({ min: 3 });

// ✅ ПРАВИЛЬНО - null разрешен
body("userName").optional({ nullable: true }).isLength({ min: 3 });
```

---

### Ошибка 4: Неправильное имя параметра

```javascript
// Роут: router.get('/:userId', ...)

// ❌ НЕПРАВИЛЬНО - имя не совпадает
param("id"); // Должно быть 'userId'!

// ✅ ПРАВИЛЬНО - имя совпадает с роутом
param("userId");
```

---

### Ошибка 5: Валидация boolean со строками

```javascript
// ❌ НЕПРАВИЛЬНО - строки "true"/"false" не пройдут
body("isActive").isBoolean(); // "true" (строка) → ошибка!

// ✅ ПРАВИЛЬНО - кастомная валидация для строк
body("isActive").custom((value) => {
  if (typeof value === "boolean") {
    return true;
  }
  if (value === "true" || value === "false") {
    return true; // Разрешаем строки
  }
  throw new Error("Значение должно быть true или false");
});
```

---

### Ошибка 6: Забыли экспортировать валидацию

```javascript
// validations/myValidation.js
// ❌ НЕПРАВИЛЬНО - нет экспорта
const myValidation = [
  /* ... */
];

// ✅ ПРАВИЛЬНО
export const myValidation = [
  /* ... */
];

// И добавить в validations/index.js
export { myValidation } from "./myValidation.js";
```

---

## 📋 Чек-лист создания валидации

При создании нового файла валидации проверьте:

- [ ] Импортированы нужные функции (`body`, `param`, `query`)
- [ ] Импортирован `handleValidationByExpressErrors`
- [ ] Все поля имеют `.withMessage()` с понятным текстом
- [ ] Опциональные поля используют `.optional()`
- [ ] Поля с поддержкой null используют `.optional({ nullable: true })`
- [ ] Строковые поля используют `.trim()` (если нужно)
- [ ] Числовые поля используют `.toInt()` или `.toFloat()` (если нужно)
- [ ] Кастомные валидации проверяют типы перед использованием
- [ ] `handleValidationByExpressErrors` добавлен в конец массива
- [ ] Валидация экспортирована
- [ ] Валидация добавлена в `validations/index.js`
- [ ] Валидация подключена в роуте в правильном порядке

---

## 🎯 Пример полного файла валидации

```javascript
// validations/productValidation.js
import { body, param } from "express-validator";
import { handleValidationByExpressErrors } from "./handleValidationByExpressErrors.js";

/**
 * Валидация параметра productId в URL
 */
export const productIdParamValidation = [
  param("productId")
    .notEmpty()
    .withMessage("ID продукта обязателен")
    .isMongoId()
    .withMessage("Неверный формат ID продукта"),
  handleValidationByExpressErrors,
];

/**
 * Валидация создания продукта
 */
export const createProductValidation = [
  body("name")
    .notEmpty()
    .withMessage("Название продукта обязательно")
    .isLength({ min: 3, max: 100 })
    .withMessage("Название должно быть от 3 до 100 символов")
    .trim(),

  body("price")
    .notEmpty()
    .withMessage("Цена обязательна")
    .isFloat({ min: 0 })
    .withMessage("Цена должна быть положительным числом")
    .toFloat(),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === null || value === "") {
        return true;
      }
      if (typeof value !== "string" || value.length > 1000) {
        throw new Error("Описание должно быть строкой не более 1000 символов");
      }
      return true;
    })
    .trim(),

  body("category")
    .isIn(["electronics", "clothing", "food"])
    .withMessage("Категория должна быть одной из: electronics, clothing, food"),

  body("isAvailable")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("isAvailable должен быть булевым значением"),

  handleValidationByExpressErrors,
];

/**
 * Валидация обновления продукта
 */
export const updateProductValidation = [
  body("name")
    .optional({ nullable: true })
    .isLength({ min: 3, max: 100 })
    .withMessage("Название должно быть от 3 до 100 символов")
    .trim(),

  body("price")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Цена должна быть положительным числом")
    .toFloat(),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === null || value === "") {
        return true;
      }
      if (typeof value !== "string" || value.length > 1000) {
        throw new Error("Описание должно быть строкой не более 1000 символов");
      }
      return true;
    })
    .trim(),

  handleValidationByExpressErrors,
];
```

---

## 🔍 Отладка валидаций

### Проверка работы валидации

1. **Отправьте запрос с невалидными данными:**

```bash
POST /auth/register
{
  "email": "invalid-email",
  "password": "123"
}
```

2. **Ожидаемый ответ:**

```json
{
  "message": "Ошибка валидации: Неверный формат email, Пароль должен быть не менее 6 символов"
}
```

3. **Если валидация не срабатывает:**
   - Проверьте, что валидация подключена в роуте
   - Проверьте порядок middleware
   - Проверьте, что `handleValidationByExpressErrors` в конце массива
   - Проверьте консоль на ошибки

---

## 📚 Дополнительные ресурсы

- [Документация express-validator](https://express-validator.github.io/docs/)
- [Список всех валидаторов](https://github.com/validatorjs/validator.js#validators)
- Примеры валидаций в проекте:
  - `validations/registerUserValidation.js`
  - `validations/updateProfileValidation.js`
  - `validations/voteValidation.js`

---

## ✅ Итоговая памятка

1. **Структура:** Импорты → Валидации → `handleValidationByExpressErrors` → Экспорт
2. **Типы:** `body()` для тела, `param()` для URL параметров, `query()` для query параметров
3. **Опциональность:** `.optional()` для опциональных полей, `.optional({ nullable: true })` для поддержки null
4. **Сообщения:** Всегда используйте `.withMessage()` с понятным текстом
5. **Обработка ошибок:** Всегда добавляйте `handleValidationByExpressErrors` в конец
6. **Экспорт:** Экспортируйте и добавляйте в `validations/index.js`
7. **Интеграция:** Подключайте в роуте перед контроллером

---

**Дата создания:** 2026-02-12  
**Версия:** 1.0.0
