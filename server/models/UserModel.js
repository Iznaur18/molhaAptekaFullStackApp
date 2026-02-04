import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: true, // required - это поле, которое определяет, что значение должно быть обязательным.
        unique: true, // unique - это поле, которое определяет, что значение должно быть уникальным.
        lowercase: true, // lowercase - это поле, которое определяет, что значение должно быть в нижнем регистре.
        trim: true, // Mongoose автоматически убирает пробелы в начале и в конце строки при сохранении (например "  user@mail.ru  " → "user@mail.ru"). Удобно для логина и поиска.
    },
    passwordHash: {
        type: String,
        required: true,
        select: false, // не отдавать по умолчанию при find()
    },
    userName: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    role: {
        // Роль можно менять программно — никаких ограничений на это на уровне схемы нет.
        // Однако! Безопасность смены роли нужно отдельно реализовать в бизнес-логике (например, ограничить изменение роли только для админа).
        // Здесь важное: просто так менять роли сможет любой код с доступом к этой модели — предусмотрите проверки в контроллерах/роутах!
        type: String,
        enum: ['user', 'admin', 'pharmacist'], // enum - это поле, которое определяет, какие значения может принимать поле.
        default: 'user', // default - это поле, которое определяет, какое значение будет по умолчанию.
    },
    avatarUrl: {
        type: String,
        default: "https://i.pinimg.com/originals/c9/31/92/c93192b782081d4d1d70b03a3c1cf011.jpg", // default - это поле, которое определяет, какое значение будет по умолчанию.
    },
    address: { // address - это поле, которое определяет, адрес пользователя.
        type: String,
        trim: true,
        required: true,
    },
    isActive: { // isActive - это поле, которое определяет, активен ли пользователь. Если пользователь активен, то он может использовать приложение. Если нет, то он не может использовать приложение.
        type: Boolean,
        default: true,
    },
    isPremium: { // isPremium - это поле, которое определяет, является ли пользователь премиум-пользователем. Если пользователь является премиум-пользователем, то он может использовать приложение в полном объеме. Если нет, то он может использовать приложение в ограниченном объеме.
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // createdAt, updatedAt - это поле, которое определяет, когда был создан пользователь и когда был последний раз обновлен.
});

export const UserModel = mongoose.model('User', UserSchema); // UserModel - это модель, которая определяет, как будет выглядеть пользователь в MongoDB.