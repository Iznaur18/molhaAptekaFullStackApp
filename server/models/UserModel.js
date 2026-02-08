import mongoose from 'mongoose';
import { DEFAULT_AVATAR_URL, DEFAULT_BACKGROUND_URL } from '../constants/constants.js';

const UserSchema = new mongoose.Schema(
  {
    // - - - Поля для входа - - -
    email: { // email пользователя
      type: String,
      required: false, // обязателен только при регистрации по email; при входе через Telegram не заполняется
      unique: true, // значение должно быть уникальным
      lowercase: true, // значение должно быть в нижнем регистре
      sparse: true, // уникальность только среди непустых; несколько null допустимы
      trim: true, // убирает пробелы в начале и в конце строки
    },
    passwordHash: { // хеш пароля
      type: String,
      required: false, // только для входа по email; при входе через Telegram не заполняется
      select: false, // не отдавать по умолчанию при find()
    },

    // - - - Информация о пользователе - - -
    userBirthDate: { // дата рождения
      type: Date, // тип даты
      default: null, // значение по умолчанию
    },
    userGender: { // пол пользователя
      type: String,
      enum: ['male', 'female', 'noSelected'], // допустимые значения поля
      default: 'noSelected', // значение по умолчанию
    },
    userAddress: { // адрес пользователя
      type: String,
      trim: true, // убирает пробелы в начале и в конце строки
      required: false,
      default: '',
    },
    userName: { // ник пользователя
      type: String,
      trim: true,
      unique: true,
      required: false, // при Telegram заполняется как tg_<telegramUserId>
      sparse: true,
    },
    userPhoneNumber: { // номер телефона пользователя (строка — сохраняются ведущие нули)
      type: String,
      trim: true,
      unique: true,
      required: false,
      sparse: true,
    },
    userLastLoginAt: { // дата последнего входа
      type: Date, // тип даты
      default: null, // значение по умолчанию
    },
    userAvatarUrl: {
      type: String,
      default: DEFAULT_AVATAR_URL, // значение по умолчанию
    },
    userBackgroundUrl: {
      type: String,
      default: DEFAULT_BACKGROUND_URL, // значение по умолчанию
    },
    isActiveUser: { // активен ли пользователь
      type: Boolean,
      default: true,
    },
    isBlockedUser: { // заблокирован ли пользователь
      type: Boolean,
      default: false,
    },
    userRole: {
      // Роль можно менять программно — никаких ограничений на это на уровне схемы нет.
      // Безопасность смены роли нужно отдельно реализовать в бизнес-логике (например, ограничить изменение роли только для админа)
      type: String,
      enum: ['user', 'admin', 'pharmacist'], // допустимые значения поля
      default: 'user', // значение по умолчанию
    },

    // - - - Поля для маркетинга - - -
    userDiscountPercent: { // процент скидки
      type: Number,
      default: 0,
    },
    notificationsEnabled: { // включены ли уведомления
      type: Boolean,
      default: false,
    },
    isPremiumUser: { // является ли пользователь премиум-пользователем
      type: Boolean,
      default: false,
    },
    notesAboutUser: { // заметки о пользователе
      type: String,
      default: '',
    },
    userLoyaltyPoints: { // количество баллов лояльности
      type: Number,
      default: 0,
    },
    userRatingByVotes: { // рейтинг пользователя по оценкам
      countVotes: { // количество проголосовавших за пользователя
        type: Number,
        default: 0,
      },
      totalRating: { // общее количество рейтинга
        type: Number,
        default: 0,
      },
    },

    // - - - Поля для входа через Telegram Web App - - -
    telegramUserId: { // telegramUserId пользователя
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    telegramUsername: { // telegramUsername пользователя
      type: String,
      trim: true,
    },
    telegramPhotoUrl: { // telegramPhotoUrl пользователя
      type: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export const UserModel = mongoose.model('User', UserSchema); // Модель пользователя для MongoDB