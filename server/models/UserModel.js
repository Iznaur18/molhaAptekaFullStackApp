import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: false, // обязателен только при регистрации по email; при входе через Telegram не заполняется
      unique: true, // значение должно быть уникальным
      lowercase: true, // значение должно быть в нижнем регистре
      sparse: true, // уникальность только среди непустых; несколько null допустимы
      trim: true, // убирает пробелы в начале и в конце строки
    },
    passwordHash: {
      type: String,
      required: false, // только для входа по email; при входе через Telegram не заполняется
      select: false, // не отдавать по умолчанию при find()
    },
    userName: {
      type: String,
      trim: true,
      unique: true,
      required: false, // при Telegram заполняется как tg_<telegramUserId>
      sparse: true,
    },
    phoneNumber: {
      type: Number,
      trim: true,
      unique: true,
      required: false,
      sparse: true,
    },
    role: {
      // Роль можно менять программно — никаких ограничений на это на уровне схемы нет.
      // Безопасность смены роли нужно отдельно реализовать в бизнес-логике (например, ограничить изменение роли только для админа)
      type: String,
      enum: ['user', 'admin', 'pharmacist'], // допустимые значения поля
      default: 'user', // значение по умолчанию
    },
    avatarUrl: {
      type: String,
      default: "https://i.pinimg.com/originals/c9/31/92/c93192b782081d4d1d70b03a3c1cf011.jpg", // значение по умолчанию
    },
    address: {
      // адрес пользователя
      type: String,
      trim: true,
    },
    isActive: {
      // активен ли пользователь
      type: Boolean,
      default: true,
    },
    isPremium: {
      // является ли пользователь премиум-пользователем
      type: Boolean,
      default: false,
    },
    // --- Поля для входа через Telegram Web App ---
    telegramUserId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    telegramUsername: {
      type: String,
      trim: true,
    },
    telegramPhotoUrl: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export const UserModel = mongoose.model('User', UserSchema); // Модель пользователя для MongoDB