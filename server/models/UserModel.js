import mongoose from "mongoose";
import { ADDRESS_LINE_MAX_LENGTH } from "../constants/dadataConstants.js";
import { DEFAULT_AVATAR_URL, DEFAULT_BACKGROUND_URL } from "../constants/constants.js";
import {
  DEFAULT_USER_AVATAR_FOCUS,
  DEFAULT_USER_BACKGROUND_FOCUS,
  PROFILE_IMAGE_FOCUS_MAX,
  PROFILE_IMAGE_FOCUS_MIN,
} from "../constants/profileImageFocusConstants.js";

const profileImageFocusSchema = new mongoose.Schema(
  {
    x: {
      type: Number,
      default: DEFAULT_USER_AVATAR_FOCUS.x,
      min: PROFILE_IMAGE_FOCUS_MIN,
      max: PROFILE_IMAGE_FOCUS_MAX,
    },
    y: {
      type: Number,
      default: DEFAULT_USER_AVATAR_FOCUS.y,
      min: PROFILE_IMAGE_FOCUS_MIN,
      max: PROFILE_IMAGE_FOCUS_MAX,
    },
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema(
  {
    // - - - Поля для входа - - -
    email: {
      // email пользователя
      type: String,
      required: false,
      unique: true, // значение должно быть уникальным
      lowercase: true, // значение должно быть в нижнем регистре
      sparse: true, // уникальность только среди непустых; несколько null допустимы
      trim: true, // убирает пробелы в начале и в конце строки
    },
    passwordHash: {
      // хеш пароля
      type: String,
      required: false,
      select: false, // не отдавать по умолчанию при find()
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    emailVerificationExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
    emailVerificationAttemptCount: {
      type: Number,
      select: false,
      default: 0,
      min: 0,
    },

    // - - - Информация о пользователе - - -
    userBirthDate: {
      // дата рождения
      type: Date, // тип даты
      default: null, // значение по умолчанию
    },
    userGender: {
      // пол пользователя
      type: String,
      enum: ["male", "female", "noSelected"], // допустимые значения поля
      default: "noSelected", // значение по умолчанию
    },
    userAddress: {
      // адрес пользователя (нормализованный DaData)
      type: String,
      trim: true, // убирает пробелы в начале и в конце строки
      required: false,
      default: "",
      maxlength: ADDRESS_LINE_MAX_LENGTH,
    },
    userAddressFlat: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    userAddressCity: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    userAddressCityNormalized: {
      type: String,
      trim: true,
      required: false,
      default: "",
      index: true,
    },
    userRegionCode: {
      type: String,
      trim: true,
      required: false,
      default: "",
      index: true,
    },
    userAddressDistrict: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    userAddressStreet: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    userAddressHouse: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    userAddressFiasId: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    userAddressGeo: {
      type: {
        lat: { type: Number },
        lon: { type: Number },
      },
      _id: false,
      default: null,
    },
    userName: {
      // ник пользователя
      type: String,
      trim: true,
      unique: true,
      required: false,
      sparse: true,
    },
    userPhoneNumber: {
      // номер телефона пользователя (строка — сохраняются ведущие нули)
      type: String,
      trim: true,
      unique: true,
      required: false,
      sparse: true,
    },
    userLastLoginAt: {
      // дата последнего входа
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
    userAvatarFocus: {
      type: profileImageFocusSchema,
      default: () => ({ ...DEFAULT_USER_AVATAR_FOCUS }),
    },
    userBackgroundFocus: {
      type: profileImageFocusSchema,
      default: () => ({ ...DEFAULT_USER_BACKGROUND_FOCUS }),
    },
    isActiveUser: {
      // активен ли пользователь
      type: Boolean,
      default: true,
    },
    isUserDataConfirmed: {
      type: Boolean,
      default: false,
    },
    isBlockedUser: {
      // заблокирован ли пользователь
      type: Boolean,
      default: false,
    },
    userRole: {
      // Роль можно менять программно — никаких ограничений на это на уровне схемы нет.
      // Безопасность смены роли нужно отдельно реализовать в бизнес-логике (например, ограничить изменение роли только для админа)
      type: String,
      enum: ["user", "admin", "moderator"], // допустимые значения поля
      default: "user", // значение по умолчанию
    },

    // - - - Поля для маркетинга - - -
    userDiscountPercent: {
      // процент скидки
      type: Number,
      default: 0,
    },
    notificationsEnabled: {
      // включены ли уведомления
      type: Boolean,
      default: false,
    },
    expoPushTokens: {
      type: [
        {
          token: { type: String, required: true, trim: true },
          platform: { type: String, default: "unknown", trim: true },
          updatedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
      select: false,
    },
    isPremiumUser: {
      // является ли пользователь премиум-пользователем
      type: Boolean,
      default: false,
    },
    premiumExpiresAt: {
      type: Date,
      default: null,
    },
    premiumExpiryReminderSentAt: {
      type: Date,
      default: null,
    },
    notesAboutUser: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    socialTelegramUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    socialInstagramUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    socialVkUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    socialYoutubeUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    socialWhatsappUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    socialWebsiteUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    userLoyaltyPoints: {
      // количество баллов лояльности
      type: Number,
      default: 0,
    },
    userLoyaltyPointsReserved: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Оплачен доступ к форме создания розыгрыша (до первого submit). */
    raffleCreateUnlockAt: {
      type: Date,
      default: null,
    },
    userRubBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    /** Уникальный код партнёрской ссылки (выдаётся лениво). */
    referralCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    /** Кто пригласил пользователя (один раз при регистрации). */
    referredByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    /** Партнёрский баланс (кэшбэк) — конвертация 1:1 в баллы. */
    partnerBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    /**
     * Legacy: предоплаченный бюджет партнёрки.
     * Новые выплаты списывают свободные баллы; остаток бюджета мигрирует в userLoyaltyPoints.
     */
    affiliateBudget: {
      type: Number,
      default: 0,
      min: 0,
    },

    // - - - Сессия / refresh rotation - - -
    authTokenVersion: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },

    // - - - Список покупок / заказов (подготовка под будущую модель) - - -
    buyList: {
      // список id заказов или покупок; при создании модели Order/Purchase указать ref: 'Order' или ref: 'Purchase'
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }], // массив id заказов или покупок
      default: [], // значение по умолчанию
    },

    // - - - Рейтинг пользователя по оценкам - - -
    userRatingByVotes: {
      // рейтинг пользователя по оценкам
      countVotes: {
        // количество проголосовавших за пользователя
        type: Number,
        default: 0,
      },
      totalRating: {
        // общее количество рейтинга
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// Индексы для производительности (email, userName, userPhoneNumber уже индексируются через unique: true в полях)
// Составной индекс для фильтрации активных пользователей по роли (для админ-панели)
UserSchema.index({ userRole: 1, isActiveUser: 1, isBlockedUser: 1 });

// Индекс для сортировки по рейтингу (для топ пользователей)
UserSchema.index({
  "userRatingByVotes.countVotes": -1,
  "userRatingByVotes.totalRating": -1,
});

// Индекс для поиска по дате последнего входа (для аналитики)
UserSchema.index({ userLastLoginAt: -1 });

// Индекс для поиска премиум пользователей
UserSchema.index({ isPremiumUser: 1 });
UserSchema.index({ isPremiumUser: 1, premiumExpiresAt: 1 });

// Уникальность только среди реальных кодов (не null) — иначе duplicate null на sparse.
UserSchema.index(
  { referralCode: 1 },
  {
    unique: true,
    partialFilterExpression: { referralCode: { $type: "string" } },
  },
);

// Список рефералов партнёрки: filter by referrer + sort by registration date.
UserSchema.index({ referredByUserId: 1, createdAt: -1 });


export const UserModel = mongoose.model("User", UserSchema); // Модель пользователя для MongoDB
