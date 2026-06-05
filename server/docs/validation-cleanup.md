# Отчет об удалении дублирующей валидации

**Дата:** 2026-02-12  
**Цель:** Удалить дублирующую валидацию из контроллеров, так как она уже выполняется в middleware

---

## ✅ Удаленная дублирующая валидация

### 1. `loginUserController.js`

**Удалено:**

```javascript
// БЫЛО:
if (!email || !password) {
  return errorRes(res, 400, "Укажите email и пароль");
}
```

**Причина:** Валидация выполняется в middleware `loginUserValidation`:

- `email` - проверка формата email
- `password` - проверка минимальной длины (6 символов)

---

### 2. `userVoteRatingController.js`

**Удалено:**

```javascript
// БЫЛО:
// Проверка наличия обязательных полей
if (!userVoteTargetIdClient || userVoteValueClient == null || !userVoterIdClient) {
  return errorRes(res, 400, "Не все поля заполнены");
}

// Оценка должна быть числом от 1 до 10
const userVoteValue = Math.round(Number(userVoteValueClient));
if (Number.isNaN(userVoteValue) || userVoteValue < 1 || userVoteValue > 10) {
  return errorRes(res, 400, "Оценка должна быть числом от 1 до 10");
}
```

**Причина:** Валидация выполняется в middleware:

- `voteTargetIdParamValidation` - проверка параметра `userVoteTargetIdClient` (ObjectId формат)
- `voteValidation` - проверка `userVoteValueClient` (число от 1 до 10)
- `userVoterIdClient` - проверяется в `checkAuthMW` (обязательно присутствует, если запрос дошел до контроллера)

**Оставлено (бизнес-логика, не валидация):**

- Проверка на голосование за себя
- Проверка на дубликат голоса
- Проверка существования целевого пользователя

---

### 4. `userUpdateProfileController.js`

**Удалено:** Вся валидация типов, форматов и диапазонов значений (строки 108-187)

**Удаленные проверки:**

- ✅ Валидация формата даты (`userBirthDate`)
- ✅ Валидация диапазона даты (не в будущем)
- ✅ Валидация enum значений (`userGender`, `userRole`)
- ✅ Валидация диапазона чисел (`userDiscountPercent` 0-100)
- ✅ Валидация формата URL (`userAvatarUrl`, `userBackgroundUrl`)
- ✅ Валидация длины строк (`userName` минимум 3 символа)
- ✅ Валидация типа строки (`userPhoneNumber`)
- ✅ Валидация типа boolean (булевы поля)

**Причина:** Вся валидация выполняется в middleware `updateProfileValidation`:

- Форматы данных
- Типы данных
- Диапазоны значений
- Enum значения
- Длина строк

**Оставлено (конвертация типов и бизнес-логика):**

- ✅ Конвертация строки в Date для `userBirthDate`
- ✅ Конвертация в Number для `userDiscountPercent`
- ✅ Применение `trim()` для строковых полей
- ✅ Проверка на пустой `updateData`
- ✅ Проверка уникальности `userName` и `userPhoneNumber`

---

## 🔧 Улучшения валидации

### `updateProfileValidation.js`

**Добавлено:** Поддержка `null` значений для очистки полей

```javascript
.optional({ nullable: true, checkFalsy: true })
.custom((value) => {
    if (value === null || value === '') {
        return true; // Разрешаем null для очистки
    }
    // валидация...
})
```

**Поля с поддержкой null:**

- `userName` - можно очистить (установить null)
- `userBirthDate` - можно очистить
- `userPhoneNumber` - можно очистить
- `userAvatarUrl` - можно очистить
- `userBackgroundUrl` - можно очистить
- `userAddress` - можно очистить
- `notesAboutUser` - можно очистить

---

## 📊 Результаты

### До очистки:

- **Дублирующая валидация:** В 4 контроллерах
- **Строк кода валидации:** ~150 строк
- **Проблемы:** Валидация выполнялась дважды (в middleware и контроллере)

### После очистки:

- **Дублирующая валидация:** Удалена
- **Строк кода валидации:** ~50 строк (только конвертация типов и бизнес-логика)
- **Результат:** Валидация выполняется только в middleware

---

## ✅ Что осталось в контроллерах (правильно)

### Бизнес-логика (не валидация):

1. **Проверка уникальности** - проверка существования пользователя с таким email/userName/phoneNumber
2. **Проверка прав доступа** - проверка owner/admin прав
3. **Проверка существования** - проверка существования пользователя в БД
4. **Проверка дубликатов** - проверка на повторное голосование
5. **Проверка бизнес-правил** - запрет голосовать за себя

### Конвертация типов (не валидация):

1. **Date конвертация** - `new Date(value)` для `userBirthDate`
2. **Number конвертация** - `Number(value)` для `userDiscountPercent`
3. **String trim** - `value.trim()` для строковых полей

### Проверки данных (не валидация формата):

1. **Проверка на пустой updateData** - проверка, что есть что обновлять
2. **Проверка userId из токена** - проверка, что токен валиден (уже в middleware)

---

## 📝 Итог

✅ **Вся валидация форматов, типов и диапазонов вынесена в middleware**  
✅ **Контроллеры содержат только бизнес-логику и конвертацию типов**  
✅ **Код стал чище и проще поддерживать**  
✅ **Нет дублирования валидации**  
✅ **Поддержка null значений для очистки полей**

---

**Файлы изменены:**

- `server/controllers/loginUserController.js`
- `server/controllers/userVoteRatingController.js`
- `server/validations/updateProfileValidation.js` (улучшена поддержка null)
