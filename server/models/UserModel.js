import mongoose from "mongoose";
import {
  USER_SAVED_ADDRESS_LABEL_MAX_LENGTH,
  USER_SAVED_ADDRESS_ID_MAX_LENGTH,
} from "@molha/api-contract";
import { ADDRESS_LINE_MAX_LENGTH } from "../constants/dadataConstants.js";
import {
  COURIER_MODERATION_COMMENT_MAX_LENGTH,
  COURIER_MODERATION_NONE,
  COURIER_MODERATION_STATUSES,
  COURIER_VEHICLE_COLOR_MAX_LENGTH,
  COURIER_VEHICLE_MAKE_MAX_LENGTH,
  COURIER_VEHICLE_PLATE_MAX_LENGTH,
} from "../constants/courierConstants.js";
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

const userSavedAddressSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      required: true,
      maxlength: USER_SAVED_ADDRESS_ID_MAX_LENGTH,
    },
    label: {
      type: String,
      trim: true,
      default: "",
      maxlength: USER_SAVED_ADDRESS_LABEL_MAX_LENGTH,
    },
    line: {
      type: String,
      trim: true,
      default: "",
      maxlength: ADDRESS_LINE_MAX_LENGTH,
    },
    flat: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    district: {
      type: String,
      trim: true,
      default: "",
    },
    street: {
      type: String,
      trim: true,
      default: "",
    },
    house: {
      type: String,
      trim: true,
      default: "",
    },
    fiasId: {
      type: String,
      trim: true,
      default: "",
    },
    geo: {
      lat: { type: Number },
      lon: { type: Number },
      _id: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
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
    /** Email, на который ушёл текущий код (привязка / смена). */
    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
      select: false,
      default: null,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    /** Номер, на который ушёл текущий SMS-код (привязка / login OTP). */
    pendingPhoneNumber: {
      type: String,
      trim: true,
      select: false,
      default: null,
    },
    phoneVerificationTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    phoneVerificationExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
    phoneVerificationAttemptCount: {
      type: Number,
      select: false,
      default: 0,
      min: 0,
    },

    /** Challenge сброса пароля (forgot) — отдельно от email/phone bind. */
    passwordResetTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
    passwordResetAttemptCount: {
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
    userAddresses: {
      type: [userSavedAddressSchema],
      default: [],
    },
    userName: {
      // ник пользователя
      type: String,
      trim: true,
      unique: true,
      required: false,
      sparse: true,
    },
    userFullName: {
      // отображаемое имя (имя, фамилия или название)
      type: String,
      trim: true,
      default: null,
      maxlength: 80,
    },
    userBusinessHoursEnabled: {
      type: Boolean,
      default: false,
    },
    userBusinessHours: {
      weekdays: {
        type: [Number],
        default: [],
      },
      openTime: {
        type: String,
        trim: true,
        default: null,
      },
      closeTime: {
        type: String,
        trim: true,
        default: null,
      },
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
    webPushSubscriptions: {
      type: [
        {
          endpoint: { type: String, required: true, trim: true },
          keys: {
            p256dh: { type: String, required: true, trim: true },
            auth: { type: String, required: true, trim: true },
          },
          expirationTime: { type: Number, default: null },
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

    // - - - Курьер - - -
    /**
     * Курьер — не отдельная сущность, а состояние обычного пользователя.
     * Отдельного кабинета нет: заявка и её статус живут в профиле.
     *
     * Регион курьера берётся из адреса профиля (`userRegionCode`), поэтому
     * подать заявку без заполненного адреса нельзя.
     */
    courierProfile: {
      moderationStatus: {
        type: String,
        enum: COURIER_MODERATION_STATUSES,
        default: COURIER_MODERATION_NONE,
      },
      /** Марка и модель одной строкой — так их и пишут в документах. */
      vehicleMake: {
        type: String,
        trim: true,
        maxlength: COURIER_VEHICLE_MAKE_MAX_LENGTH,
        default: "",
      },
      vehicleColor: {
        type: String,
        trim: true,
        maxlength: COURIER_VEHICLE_COLOR_MAX_LENGTH,
        default: "",
      },
      vehiclePlate: {
        type: String,
        trim: true,
        maxlength: COURIER_VEHICLE_PLATE_MAX_LENGTH,
        default: "",
      },
      /**
       * Снимки к заявке: авто спереди и сзади, права, ПТС.
       *
       * Лежат в private uploads и хранятся как `/upload/private/<file>` —
       * отдаются только стаффу и самому курьеру.
       */
      vehiclePhotoFrontUrl: { type: String, trim: true, default: "" },
      vehiclePhotoRearUrl: { type: String, trim: true, default: "" },
      driverLicensePhotoUrl: { type: String, trim: true, default: "" },
      vehicleRegistrationPhotoUrl: { type: String, trim: true, default: "" },
      submittedAt: { type: Date, default: null },
      reviewedAt: { type: Date, default: null },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      /** Причина отказа — курьер должен понимать, что исправить. */
      moderationComment: {
        type: String,
        trim: true,
        maxlength: COURIER_MODERATION_COMMENT_MAX_LENGTH,
        default: "",
      },
      /**
       * Сколько раз курьер отказался от уже принятой заявки. Штрафов в v1
       * нет, но без счётчика не отличить нормального курьера от того, кто
       * берёт заказы ради адресов.
       */
      declinedJobCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    /**
     * Куда покупатель переводит при оплате картой в момент получения.
     *
     * Без них курьерская доставка не работает: покупатель стоит у двери и не
     * знает, куда переводить. При самовывозе люди встречаются лично, и
     * реквизиты не нужны.
     */
    sellerPayoutRequisites: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
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

    /**
     * Интеграция с 1С (per-seller). Секреты хранятся зашифрованными.
     *
     * Два канала (`channel`):
     *  - `pull` — сайт сам ходит в HTTP-сервис 1С (docs/product/onec-http-contract.md);
     *  - `commerceml` — 1С сама шлёт CommerceML на `/onec/exchange`
     *    (docs/product/onec-commerceml-exchange.md), штатный «Обмен с сайтом» в УТ 11.
     */
    oneCIntegration: {
      enabled: {
        type: Boolean,
        default: false,
      },
      channel: {
        type: String,
        enum: ["pull", "commerceml"],
        default: "pull",
      },
      /** Доступы, которые продавец вбивает в узел обмена 1С (только для `commerceml`). */
      exchange: {
        login: {
          type: String,
          default: "",
          trim: true,
          maxlength: 64,
        },
        /** bcrypt-хэш. Пароль показывается один раз при генерации. */
        passwordHash: {
          type: String,
          default: "",
          maxlength: 200,
        },
        /**
         * Ид типов цен из `offers.xml`, которые продавец разрешил на витрину.
         * Пусто — берём первый попавшийся тип (типовой случай «одна цена»).
         */
        priceTypeIds: {
          type: [String],
          default: [],
        },
        /** Ид складов, чьи остатки суммируем. Пусто — суммируем все. */
        warehouseIds: {
          type: [String],
          default: [],
        },
        /** Справочники, увиденные в последнем `offers.xml` — для чекбоксов в кабинете. */
        knownPriceTypes: {
          type: [
            {
              _id: false,
              externalId: { type: String, default: "", maxlength: 128 },
              name: { type: String, default: "", maxlength: 200 },
            },
          ],
          default: [],
        },
        knownWarehouses: {
          type: [
            {
              _id: false,
              externalId: { type: String, default: "", maxlength: 128 },
              name: { type: String, default: "", maxlength: 200 },
            },
          ],
          default: [],
        },
        lastExchangeAt: {
          type: Date,
          default: null,
        },
      },
      baseUrl: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },
      /** AES-GCM blob или legacy plain string — не отдаём в публичные GET /user */
      apiKeySealed: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      lastSyncAt: {
        type: Date,
        default: null,
      },
      lastSyncStatus: {
        type: String,
        enum: ["idle", "success", "error"],
        default: "idle",
      },
      lastSyncError: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },
      lastSyncSummary: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
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

/** Очередь модерации курьеров: свежие заявки сверху. */
UserSchema.index(
  { "courierProfile.moderationStatus": 1, "courierProfile.submittedAt": -1 },
  { name: "courier_moderation_queue" },
);

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

UserSchema.index(
  { "oneCIntegration.enabled": 1 },
  { name: "onec_integration_enabled" },
);

/** `mode=checkauth`: логин → продавец. Уникален глобально, иначе Basic auth неоднозначен. */
UserSchema.index(
  { "oneCIntegration.exchange.login": 1 },
  {
    unique: true,
    name: "onec_exchange_login_unique",
    partialFilterExpression: {
      "oneCIntegration.exchange.login": { $type: "string", $gt: "" },
    },
  },
);

export const UserModel = mongoose.model("User", UserSchema); // Модель пользователя для MongoDB
